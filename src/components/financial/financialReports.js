/**
 * Financial Reports Component
 */

import financialService from '../../services/financialService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, statusBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class FinancialReports {
    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader(t('financial.reportsTitle'), t('financial.reportsSubtitle'))}
                <div id="reports-content"><div class="flex justify-center py-12"><div class="page-loader"></div></div></div>
            </div>
        `;
    }

    async init() {
        try {
            const [revenue, outstanding] = await Promise.all([
                financialService.getRevenueReport({ period: 'monthly' }),
                financialService.getOutstandingReport(),
            ]);

            const totalRevenue = revenue.summary?.totalPaid ?? revenue.data?.reduce((sum, r) => sum + (r.paidRevenue || 0), 0) ?? 0;
            const outstandingTotal = outstanding.summary?.totalAmount ?? outstanding.invoices?.reduce((s, i) => s + (i.balanceDue || 0), 0) ?? 0;

            document.getElementById('reports-content').innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <p class="text-sm text-gray-500">${t('financial.totalRevenue')}</p>
                        <p class="text-3xl font-bold text-gray-900 mt-1">${formatCurrency(totalRevenue)}</p>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <p class="text-sm text-gray-500">${t('financial.totalOutstanding')}</p>
                        <p class="text-3xl font-bold text-red-600 mt-1">${formatCurrency(outstandingTotal)}</p>
                    </div>
                </div>
                ${outstanding.invoices?.length ? renderDetailCard(t('financial.outstandingInvoices'), `
                    <ul class="divide-y divide-gray-200">${outstanding.invoices.map(inv => `
                        <li class="py-3 flex justify-between items-center text-sm">
                            <div>
                                <p class="font-medium">${inv.invoiceNumber} — ${inv.clientName || t('financial.client')}</p>
                                <p class="text-gray-500">${t('financial.due')}: ${inv.dueDate}</p>
                            </div>
                            <div class="text-right">
                                <p class="font-medium">${formatCurrency(inv.balanceDue)}</p>
                                ${statusBadge(inv.status)}
                            </div>
                        </li>
                    `).join('')}</ul>
                `) : `<p class="text-gray-500">${t('financial.noOutstandingInvoices')}</p>`}
            `;
        } catch (error) {
            document.getElementById('reports-content').innerHTML = `<p class="text-red-600">${t('financial.errorLoadingReports')}</p>`;
        }
    }

    destroy() {}
}
