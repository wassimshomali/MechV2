/**
 * Data Table Component for MoMech
 * Reusable table with sorting, pagination, and search
 */

import { formatTableCell, calculatePagination } from '../../utils/index.js';

export class DataTable {
    constructor(options = {}) {
        this.containerId = options.containerId;
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.pagination = options.pagination || null;
        this.sortable = options.sortable !== false;
        this.searchable = options.searchable !== false;
        this.selectable = options.selectable || false;
        this.actions = options.actions || [];
        this.onSort = options.onSort || null;
        this.onPageChange = options.onPageChange || null;
        this.onSearch = options.onSearch || null;
        this.onRowClick = options.onRowClick || null;
        this.onSelect = options.onSelect || null;
        this.emptyMessage = options.emptyMessage || 'No data available';
        this.loading = options.loading || false;
        
        this.selectedRows = new Set();
        this.currentSort = { column: null, direction: 'asc' };
    }
    
    /**
     * Render the table
     * @returns {string} - Table HTML
     */
    render() {
        return `
            <div class="table-container">
                ${this.searchable ? this.renderSearch() : ''}
                ${this.renderTable()}
                ${this.pagination ? this.renderPagination() : ''}
            </div>
        `;
    }
    
    /**
     * Render search bar
     * @returns {string} - Search HTML
     */
    renderSearch() {
        return `
            <div class="mb-4 flex items-center justify-between">
                <div class="relative flex-1 max-w-md">
                    <input 
                        type="text" 
                        id="table-search"
                        placeholder="Search..." 
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <i data-feather="search" class="absolute left-3 top-2.5 text-gray-400 w-4 h-4"></i>
                </div>
                ${this.actions.length > 0 ? this.renderTableActions() : ''}
            </div>
        `;
    }
    
    /**
     * Render table actions
     * @returns {string} - Actions HTML
     */
    renderTableActions() {
        return `
            <div class="flex items-center space-x-2">
                ${this.actions.map(action => `
                    <button 
                        type="button"
                        class="table-action-btn px-4 py-2 text-sm font-medium rounded-md ${action.class || 'bg-blue-600 text-white hover:bg-blue-700'}"
                        data-action="${action.name}"
                        ${action.disabled ? 'disabled' : ''}
                    >
                        ${action.icon ? `<i data-feather="${action.icon}" class="w-4 h-4 mr-2 inline"></i>` : ''}
                        ${action.label}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Render the main table
     * @returns {string} - Table HTML
     */
    renderTable() {
        if (this.loading) {
            return this.renderLoading();
        }
        
        if (!this.data || this.data.length === 0) {
            return this.renderEmpty();
        }
        
        return `
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                        <tr>
                            ${this.selectable ? '<th class="w-4 p-4"><input type="checkbox" id="select-all" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"></th>' : ''}
                            ${this.columns.map(column => this.renderHeaderCell(column)).join('')}
                            ${this.hasRowActions() ? '<th class="relative py-3.5 pl-3 pr-4 sm:pr-6"><span class="sr-only">Actions</span></th>' : ''}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        ${this.data.map((row, index) => this.renderRow(row, index)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    /**
     * Render table header cell
     * @param {object} column - Column configuration
     * @returns {string} - Header cell HTML
     */
    renderHeaderCell(column) {
        const sortable = this.sortable && column.sortable !== false;
        const isSorted = this.currentSort.column === column.key;
        const sortDirection = this.currentSort.direction;
        
        return `
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-100' : ''}" 
                ${sortable ? `data-sort="${column.key}"` : ''}>
                <div class="flex items-center">
                    <span>${column.label}</span>
                    ${sortable ? `
                        <span class="ml-2 flex-none rounded text-gray-400">
                            <i data-feather="chevron-${isSorted && sortDirection === 'desc' ? 'down' : 'up'}" class="w-4 h-4 ${isSorted ? 'text-gray-900' : ''}"></i>
                        </span>
                    ` : ''}
                </div>
            </th>
        `;
    }
    
    /**
     * Render table row
     * @param {object} row - Row data
     * @param {number} index - Row index
     * @returns {string} - Row HTML
     */
    renderRow(row, index) {
        const isSelected = this.selectedRows.has(row.id);
        
        return `
            <tr class="table-row hover:bg-gray-50 ${this.onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-blue-50' : ''}" 
                data-row-id="${row.id}" data-row-index="${index}">
                ${this.selectable ? `
                    <td class="w-4 p-4">
                        <input type="checkbox" class="row-select rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                               value="${row.id}" ${isSelected ? 'checked' : ''}>
                    </td>
                ` : ''}
                ${this.columns.map(column => this.renderCell(row, column)).join('')}
                ${this.hasRowActions() ? this.renderRowActions(row) : ''}
            </tr>
        `;
    }
    
    /**
     * Render table cell
     * @param {object} row - Row data
     * @param {object} column - Column configuration
     * @returns {string} - Cell HTML
     */
    renderCell(row, column) {
        let value = row[column.key];
        
        // Apply custom formatter if provided
        if (column.formatter && typeof column.formatter === 'function') {
            value = column.formatter(value, row);
        } else if (column.type) {
            value = formatTableCell(value, column.type, column.formatOptions);
        }
        
        const cellClass = column.cellClass || '';
        
        return `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${cellClass}">
                ${value || '-'}
            </td>
        `;
    }
    
    /**
     * Render row actions
     * @param {object} row - Row data
     * @returns {string} - Actions HTML
     */
    renderRowActions(row) {
        const rowActions = this.columns.find(col => col.key === 'actions');
        if (!rowActions || !rowActions.actions) return '<td></td>';
        
        return `
            <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div class="flex items-center justify-end space-x-2">
                    ${rowActions.actions.map(action => `
                        <button 
                            type="button"
                            class="row-action-btn text-${action.color || 'blue'}-600 hover:text-${action.color || 'blue'}-900"
                            data-action="${action.name}"
                            data-row-id="${row.id}"
                            title="${action.label}"
                        >
                            <i data-feather="${action.icon}" class="w-4 h-4"></i>
                        </button>
                    `).join('')}
                </div>
            </td>
        `;
    }
    
    /**
     * Render loading state
     * @returns {string} - Loading HTML
     */
    renderLoading() {
        return `
            <div class="bg-white shadow rounded-lg">
                <div class="animate-pulse">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    ${Array(5).fill().map(() => `
                        <div class="px-6 py-4 border-b border-gray-200">
                            <div class="flex space-x-4">
                                <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/5"></div>
                                <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render empty state
     * @returns {string} - Empty state HTML
     */
    renderEmpty() {
        return `
            <div class="bg-white shadow rounded-lg">
                <div class="text-center py-12">
                    <i data-feather="inbox" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <h3 class="text-sm font-medium text-gray-900 mb-2">No data found</h3>
                    <p class="text-sm text-gray-500">${this.emptyMessage}</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Render pagination
     * @returns {string} - Pagination HTML
     */
    renderPagination() {
        if (!this.pagination) return '';
        
        const { page, totalPages, total, startItem, endItem, hasPrev, hasNext } = this.pagination;
        
        return `
            <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button 
                        class="pagination-btn relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-page="${page - 1}" ${!hasPrev ? 'disabled' : ''}
                    >
                        Previous
                    </button>
                    <button 
                        class="pagination-btn ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}"
                        data-page="${page + 1}" ${!hasNext ? 'disabled' : ''}
                    >
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            ${this.renderPaginationButtons()}
                        </nav>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render pagination buttons
     * @returns {string} - Pagination buttons HTML
     */
    renderPaginationButtons() {
        const { page, totalPages, hasPrev, hasNext } = this.pagination;
        const buttons = [];
        
        // Previous button
        buttons.push(`
            <button 
                class="pagination-btn relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}"
                data-page="${page - 1}" ${!hasPrev ? 'disabled' : ''}
            >
                <i data-feather="chevron-left" class="w-4 h-4"></i>
            </button>
        `);
        
        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);
        
        if (startPage > 1) {
            buttons.push(this.renderPageButton(1));
            if (startPage > 2) {
                buttons.push('<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>');
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(this.renderPageButton(i, i === page));
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push('<span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>');
            }
            buttons.push(this.renderPageButton(totalPages));
        }
        
        // Next button
        buttons.push(`
            <button 
                class="pagination-btn relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}"
                data-page="${page + 1}" ${!hasNext ? 'disabled' : ''}
            >
                <i data-feather="chevron-right" class="w-4 h-4"></i>
            </button>
        `);
        
        return buttons.join('');
    }
    
    /**
     * Render page button
     * @param {number} pageNum - Page number
     * @param {boolean} active - Whether page is active
     * @returns {string} - Page button HTML
     */
    renderPageButton(pageNum, active = false) {
        return `
            <button 
                class="pagination-btn relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    active 
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }"
                data-page="${pageNum}"
            >
                ${pageNum}
            </button>
        `;
    }
    
    /**
     * Initialize table functionality
     */
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = this.render();
        this.attachEventListeners();
        replaceFeatherIcons();
    }
    
    /**
     * Update table data
     * @param {array} data - New data
     * @param {object} pagination - New pagination info
     */
    update(data, pagination = null) {
        this.data = data;
        this.pagination = pagination;
        this.selectedRows.clear();
        this.init();
    }
    
    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        this.loading = loading;
        const container = document.getElementById(this.containerId);
        if (container) {
            const tableContainer = container.querySelector('.table-container');
            if (tableContainer) {
                if (loading) {
                    tableContainer.innerHTML = this.renderLoading();
                } else {
                    this.init();
                }
            }
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        // Search functionality
        const searchInput = container.querySelector('#table-search');
        if (searchInput && this.onSearch) {
            searchInput.addEventListener('input', (e) => {
                if (this.onSearch) {
                    this.onSearch(e.target.value);
                }
            });
        }
        
        // Sorting functionality
        if (this.sortable) {
            const sortHeaders = container.querySelectorAll('[data-sort]');
            sortHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const column = header.dataset.sort;
                    const direction = this.currentSort.column === column && this.currentSort.direction === 'asc' ? 'desc' : 'asc';
                    
                    this.currentSort = { column, direction };
                    
                    if (this.onSort) {
                        this.onSort(column, direction);
                    }
                });
            });
        }
        
        // Pagination functionality
        const paginationButtons = container.querySelectorAll('.pagination-btn');
        paginationButtons.forEach(button => {
            button.addEventListener('click', () => {
                const page = parseInt(button.dataset.page);
                if (page && this.onPageChange) {
                    this.onPageChange(page);
                }
            });
        });
        
        // Row selection
        if (this.selectable) {
            const selectAllCheckbox = container.querySelector('#select-all');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    this.selectAll(e.target.checked);
                });
            }
            
            const rowCheckboxes = container.querySelectorAll('.row-select');
            rowCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.selectRow(e.target.value, e.target.checked);
                });
            });
        }
        
        // Row click functionality
        if (this.onRowClick) {
            const rows = container.querySelectorAll('.table-row');
            rows.forEach(row => {
                row.addEventListener('click', (e) => {
                    // Don't trigger row click if clicking on a button or checkbox
                    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
                    
                    const rowId = row.dataset.rowId;
                    const rowIndex = parseInt(row.dataset.rowIndex);
                    const rowData = this.data[rowIndex];
                    
                    this.onRowClick(rowData, rowId, rowIndex);
                });
            });
        }
        
        // Row actions
        const actionButtons = container.querySelectorAll('.row-action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                const rowId = button.dataset.rowId;
                const rowData = this.data.find(row => row.id == rowId);
                
                this.handleRowAction(action, rowData, rowId);
            });
        });
        
        // Table actions
        const tableActionButtons = container.querySelectorAll('.table-action-btn');
        tableActionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleTableAction(action);
            });
        });
    }
    
    /**
     * Handle row actions
     * @param {string} action - Action name
     * @param {object} rowData - Row data
     * @param {string} rowId - Row ID
     */
    handleRowAction(action, rowData, rowId) {
        const actionConfig = this.columns
            .find(col => col.key === 'actions')?.actions
            .find(a => a.name === action);
        
        if (actionConfig && actionConfig.handler) {
            actionConfig.handler(rowData, rowId);
        }
    }
    
    /**
     * Handle table actions
     * @param {string} action - Action name
     */
    handleTableAction(action) {
        const actionConfig = this.actions.find(a => a.name === action);
        
        if (actionConfig && actionConfig.handler) {
            actionConfig.handler(Array.from(this.selectedRows));
        }
    }
    
    /**
     * Select/deselect all rows
     * @param {boolean} selected - Whether to select all
     */
    selectAll(selected) {
        if (selected) {
            this.data.forEach(row => this.selectedRows.add(row.id));
        } else {
            this.selectedRows.clear();
        }
        
        // Update UI
        const container = document.getElementById(this.containerId);
        const checkboxes = container.querySelectorAll('.row-select');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selected;
        });
        
        if (this.onSelect) {
            this.onSelect(Array.from(this.selectedRows));
        }
    }
    
    /**
     * Select/deselect a single row
     * @param {string} rowId - Row ID
     * @param {boolean} selected - Whether to select
     */
    selectRow(rowId, selected) {
        if (selected) {
            this.selectedRows.add(rowId);
        } else {
            this.selectedRows.delete(rowId);
        }
        
        // Update select all checkbox
        const container = document.getElementById(this.containerId);
        const selectAllCheckbox = container.querySelector('#select-all');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = this.selectedRows.size === this.data.length;
            selectAllCheckbox.indeterminate = this.selectedRows.size > 0 && this.selectedRows.size < this.data.length;
        }
        
        if (this.onSelect) {
            this.onSelect(Array.from(this.selectedRows));
        }
    }
    
    /**
     * Check if table has row actions
     * @returns {boolean} - Whether table has row actions
     */
    hasRowActions() {
        return this.columns.some(col => col.key === 'actions' && col.actions);
    }
    
    /**
     * Get selected row IDs
     * @returns {array} - Array of selected row IDs
     */
    getSelectedRows() {
        return Array.from(this.selectedRows);
    }
    
    /**
     * Clear selection
     */
    clearSelection() {
        this.selectedRows.clear();
        const container = document.getElementById(this.containerId);
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }
}