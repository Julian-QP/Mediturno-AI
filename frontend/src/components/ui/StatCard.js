import {escapeHtml} from '../../utils/format.js';
export const statCard=(value,label,href,icon='▦')=>`<a class="stat-card" href="#${href}"><span class="stat-icon">${icon}</span><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></a>`;
