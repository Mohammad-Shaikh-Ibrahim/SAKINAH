import { v4 as uuidv4 } from 'uuid';
import { secureStore } from '../../../shared/utils/secureStore';
import { logger } from '../../../shared/utils/logger';

const STORAGE_KEY = 'documents_db_v1';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const DOCUMENT_CATEGORIES = [
    { id: 'lab-results', name: 'Lab Results', icon: 'science', color: '#1976d2' },
    { id: 'imaging', name: 'Imaging (X-ray, MRI, CT)', icon: 'medical_services', color: '#7b1fa2' },
    { id: 'prescription', name: 'Prescriptions', icon: 'medication', color: '#388e3c' },
    { id: 'insurance', name: 'Insurance Documents', icon: 'card_membership', color: '#f57c00' },
    { id: 'consent', name: 'Consent Forms', icon: 'description', color: '#0288d1' },
    { id: 'referral', name: 'Referral Letters', icon: 'send', color: '#5d4037' },
    { id: 'other', name: 'Other Documents', icon: 'insert_drive_file', color: '#616161' },
];

export function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function getFileExtension(fileName) {
    if (!fileName) return '';
    const idx = fileName.lastIndexOf('.');
    return idx !== -1 ? fileName.slice(idx).toLowerCase() : '';
}

export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function base64ToBlob(base64, mimeType) {
    const byteChars = atob(base64.split(',')[1]);
    const byteNumbers = Array.from(byteChars, (c) => c.charCodeAt(0));
    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
}

export function downloadFile(base64Data, fileName, mimeType) {
    const blob = base64ToBlob(base64Data, mimeType);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

class LocalStorageDocumentsRepository {
    _getAll() {
        return secureStore.getItem(STORAGE_KEY) || [];
    }

    _save(data) {
        secureStore.setItem(STORAGE_KEY, data);
    }

    async getCategories() {
        return DOCUMENT_CATEGORIES;
    }

    async getDocumentsByPatient(patientId, userId, { category, search } = {}) {
        await delay();
        let docs = this._getAll().filter(
            (d) => d.patientId === patientId && d.uploadedBy === userId && !d.isArchived
        );

        if (category && category !== 'all') {
            docs = docs.filter((d) => d.category === category);
        }

        if (search) {
            const q = search.toLowerCase();
            docs = docs.filter(
                (d) =>
                    (d.fileName || '').toLowerCase().includes(q) ||
                    (d.description || '').toLowerCase().includes(q)
            );
        }

        // Sort newest first, exclude base64 from return for listing
        docs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        return docs.map(({ base64Data: _b, ...rest }) => rest);
    }

    async getDocumentById(id, userId) {
        await delay(200);
        const docs = this._getAll();
        const doc = docs.find((d) => d.id === id);
        if (!doc) throw new Error('Document not found');
        if (doc.uploadedBy !== userId) throw new Error('Access denied');
        return doc;
    }

    async uploadDocument({ file, patientId, userId, category, description, notes, tags = [] }) {
        await delay(800);

        const base64Data = await fileToBase64(file);
        const ext = getFileExtension(file.name);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.replace('.', ''));

        const newDoc = {
            id: `doc-${uuidv4()}`,
            patientId,
            uploadedBy: userId,
            fileName: file.name,
            fileType: file.type,
            fileExtension: ext,
            fileSize: file.size,
            fileSizeFormatted: formatFileSize(file.size),
            category,
            description: description || file.name,
            notes: notes || '',
            tags,
            uploadDate: new Date().toISOString(),
            base64Data,
            isImage,
            viewCount: 0,
            lastViewedDate: null,
            isArchived: false,
            version: 1,
        };

        const docs = this._getAll();
        docs.unshift(newDoc);
        this._save(docs);
        const { base64Data: _b, ...rest } = newDoc;
        return rest;
    }

    async updateDocument(id, updates, userId) {
        await delay(400);
        const docs = this._getAll();
        const idx = docs.findIndex((d) => d.id === id);
        if (idx === -1) throw new Error('Document not found');
        if (docs[idx].uploadedBy !== userId) throw new Error('Access denied');
        docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() };
        this._save(docs);
        const { base64Data: _b, ...rest } = docs[idx];
        return rest;
    }

    async deleteDocument(id, userId) {
        await delay(400);
        let docs = this._getAll();
        const doc = docs.find((d) => d.id === id);
        if (!doc) throw new Error('Document not found');
        if (doc.uploadedBy !== userId) throw new Error('Access denied');
        docs = docs.filter((d) => d.id !== id);
        this._save(docs);
        return { id, success: true };
    }

    async incrementViewCount(id, userId) {
        const docs = this._getAll();
        const idx = docs.findIndex((d) => d.id === id);
        if (idx !== -1 && docs[idx].uploadedBy === userId) {
            docs[idx].viewCount = (docs[idx].viewCount || 0) + 1;
            docs[idx].lastViewedDate = new Date().toISOString();
            this._save(docs);
        }
    }

    async getCategoryCounts(patientId, userId) {
        const docs = this._getAll().filter(
            (d) => d.patientId === patientId && d.uploadedBy === userId && !d.isArchived
        );
        const counts = { all: docs.length };
        DOCUMENT_CATEGORIES.forEach((cat) => {
            counts[cat.id] = docs.filter((d) => d.category === cat.id).length;
        });
        return counts;
    }

    async getStats(userId) {
        await delay(200);
        const docs = this._getAll().filter((d) => d.uploadedBy === userId && !d.isArchived);
        const totalSize = docs.reduce((sum, d) => sum + (d.fileSize || 0), 0);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUploads = docs.filter((d) => new Date(d.uploadDate) >= sevenDaysAgo).length;
        return {
            totalDocuments: docs.length,
            totalStorageUsed: totalSize,
            totalStorageFormatted: formatFileSize(totalSize),
            recentUploads,
        };
    }
}

export const documentsRepository = new LocalStorageDocumentsRepository();
