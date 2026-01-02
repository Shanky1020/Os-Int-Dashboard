// ============================================
// FILE: js/data.js
// ============================================

const DataPage = {
  relationshipId: null,
  currentPage: 1,
  pageSize: 10,
  totalRecords: 0,
  totalPages: 0,

  init(data) {
    this.relationshipId = data.relationshipId;
    // Setup back button
    document.getElementById('data-back-btn').addEventListener('click', (e) => {
      App.loadPage('detail', { relationshipId: this.relationshipId });
    });

    // Setup add new row button
    document.getElementById('add-new-row-btn').addEventListener('click', () => {
      this.openEditModal();
    });

    // Setup save edit button
    document.getElementById('save-edit-btn').addEventListener('click', () => {
      this.saveEdit();
    });

    // Setup export to excel button
    document.getElementById('export-excel-btn').addEventListener('click', () => {
      this.exportToExcel();
    });

    this.loadRelationships();
    this.loadTableData(1);
  },

  async loadRelationships() {
    try {
      this.relationships = await SupabaseService.getRelationships();
      this.populateRelationshipSelect();
    } catch (error) {
      console.error('Error loading relationships:', error);
    }
  },

  populateRelationshipSelect() {
    const select = document.getElementById('edit-relationship-id');
    select.innerHTML = '';
    this.relationships.forEach(rel => {
      const option = document.createElement('option');
      option.value = rel.id;
      option.textContent = rel.name;
      select.appendChild(option);
    });
  },

  async loadTableData(page = 1) {
    this.currentPage = page;
    try {
      // First get total count
      const { count, error: countError } = await SupabaseService.client
        .from('country_monitored_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('relationship_id', this.relationshipId);

      if (countError) throw countError;
      this.totalRecords = count || 0;
      this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

      // Then get paginated data
      const start = (page - 1) * this.pageSize;
      const end = start + this.pageSize - 1;
      const { data, error } = await SupabaseService.client
        .from('country_monitored_relationships')
        .select(`
          *,
          relationships (
            name
          )
        `)
        .eq('relationship_id', this.relationshipId)
        .range(start, end)
        .order('created_at', { ascending: true });

      if (error) throw error;
      this.tableData = data || [];
      this.displayTable();
      this.displayPagination();
    } catch (error) {
      console.error('Error loading table data:', error);
      document.getElementById('data-table-body').innerHTML = '<tr><td colspan="12" class="text-center text-danger">Error loading data</td></tr>';
    }
  },

  displayTable() {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';

    if (this.tableData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="12" class="text-center">No data available</td></tr>';
      return;
    }

    this.tableData.forEach((row, index) => {
      const tr = document.createElement('tr');
      const relationshipName = row.relationship_id ? row.relationships.name : 'N/A';
      const serialNumber = (this.currentPage - 1) * this.pageSize + index + 1;
      
      tr.innerHTML = `
        <td>${serialNumber}</td>
        <td>${relationshipName}</td>
        <td>${row.column_1 || ''}</td>
        <td>${row.column_2 || ''}</td>
        <td>${row.column_3 || ''}</td>
        <td>${row.column_4 || ''}</td>
        <td>${row.column_5 || ''}</td>
        <td>${row.column_6 || ''}</td>
        <td>${row.column_7 ? `<img src="${row.column_7}" alt="Image" style="width: 50px; height: 50px; cursor: pointer;" class="table-image">` : ''}</td>
        <td>${row.column_8 ? `<a href="${row.column_8}" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-earmark-pdf"></i> View PDF</a>` : ''}</td>
        <td>${new Date(row.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${row.id}" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id}" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.editRow(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.deleteRow(id);
      });
    });

    // Add event listeners for table images
    document.querySelectorAll('.table-image').forEach(img => {
      img.addEventListener('click', (e) => {
        this.openImageModal(e.target.src);
      });
    });

    // Add modal event listeners
    document.getElementById('imageModalClose').addEventListener('click', () => {
      document.getElementById('imageModal').style.display = 'none';
    });

    document.getElementById('pdfModalClose').addEventListener('click', () => {
      document.getElementById('pdfModal').style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === document.getElementById('imageModal')) {
        document.getElementById('imageModal').style.display = 'none';
      }
      if (e.target === document.getElementById('pdfModal')) {
        document.getElementById('pdfModal').style.display = 'none';
      }
    });
  },

  displayPagination() {
    const paginationDiv = document.getElementById('pagination-controls');
    paginationDiv.innerHTML = '';

    if (this.totalPages <= 1) return;

    const ul = document.createElement('ul');
    ul.className = 'pagination';

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
    const prevA = document.createElement('a');
    prevA.className = 'page-link';
    prevA.href = '#';
    prevA.textContent = 'Previous';
    prevA.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage > 1) {
        this.loadTableData(this.currentPage - 1);
      }
    });
    prevLi.appendChild(prevA);
    ul.appendChild(prevLi);

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = i;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.loadTableData(i);
      });
      li.appendChild(a);
      ul.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
    const nextA = document.createElement('a');
    nextA.className = 'page-link';
    nextA.href = '#';
    nextA.textContent = 'Next';
    nextA.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage < this.totalPages) {
        this.loadTableData(this.currentPage + 1);
      }
    });
    nextLi.appendChild(nextA);
    ul.appendChild(nextLi);

    paginationDiv.appendChild(ul);
  },

  openImageModal(src) {
    // Remove any existing Bootstrap modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('imageModalContent');
    const caption = document.getElementById('imageModalCaption');
    modal.style.display = 'block';
    modalImg.src = src;
    caption.innerHTML = 'Image Preview';
  },

  openEditModal(rowId = null) {
    const modal = new bootstrap.Modal(document.getElementById('editModal'));
    const modalTitle = document.querySelector('#editModal .modal-title');
    
    document.getElementById('edit-id').value = rowId || '';
    
    if (rowId) {
      modalTitle.textContent = 'Edit Row';
      const row = this.tableData.find(r => r.id == rowId);
      if (row) {
        document.getElementById('edit-relationship-id').value = row.relationship_id;
        document.getElementById('edit-column-1').value = row.column_1 || '';
        document.getElementById('edit-column-2').value = row.column_2 || '';
        document.getElementById('edit-column-3').value = row.column_3 || '';
        document.getElementById('edit-column-4').value = row.column_4 || '';
        document.getElementById('edit-column-5').value = row.column_5 || '';
        document.getElementById('edit-column-6').value = row.column_6 || '';
        // For files, show current
        const currentImageDiv = document.getElementById('current-image-7');
        currentImageDiv.innerHTML = row.column_7 ? `<img src="${row.column_7}" style="width: 100px; height: 100px;">` : '';
        const currentPdfDiv = document.getElementById('current-pdf-8');
        currentPdfDiv.innerHTML = row.column_8 ? `<a href="${row.column_8}" target="_blank">View Current PDF</a>` : '';
      }
    } else {
      modalTitle.textContent = 'Add New Row';
      // Clear form for new row and pre-select current relationship
      document.getElementById('edit-form').reset();
      document.getElementById('edit-relationship-id').value = this.relationshipId;
      document.getElementById('current-image-7').innerHTML = '';
      document.getElementById('current-pdf-8').innerHTML = '';
    }
    
    modal.show();
  },

  async saveEdit() {
    const id = document.getElementById('edit-id').value;
    const data = {
      relationship_id: parseInt(document.getElementById('edit-relationship-id').value),
      column_1: document.getElementById('edit-column-1').value,
      column_2: document.getElementById('edit-column-2').value,
      column_3: document.getElementById('edit-column-3').value,
      column_4: document.getElementById('edit-column-4').value,
      column_5: document.getElementById('edit-column-5').value,
      column_6: document.getElementById('edit-column-6').value,
    };

    // Handle file uploads
    const imageFile = document.getElementById('edit-column-7').files[0];
    const pdfFile = document.getElementById('edit-column-8').files[0];

    try {
      if (imageFile) {
        const imageData = await this.readFileAsDataURL(imageFile);
        data.column_7 = imageData;
      }

      if (pdfFile) {
        const pdfData = await this.readFileAsDataURL(pdfFile);
        data.column_8 = pdfData;
      }

      if (id) {
        // Update
        const { error } = await SupabaseService.client
          .from('country_monitored_relationships')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await SupabaseService.client
          .from('country_monitored_relationships')
          .insert([data]);
        if (error) throw error;
      }

      // Close modal and reload data
      const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
      modal.hide();
      this.loadTableData(this.currentPage);
    } catch (error) {
      console.error('Error saving:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Error saving data: ' + error.message,
        icon: 'error',
        background: '#343a40',
        color: '#ffffff'
      });
    }
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async deleteRow(id) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#343a40',
      color: '#ffffff'
    });

    if (!result.isConfirmed) return;

    try {
      const { error } = await SupabaseService.client
        .from('country_monitored_relationships')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'The row has been deleted.',
        icon: 'success',
        background: '#343a40',
        color: '#ffffff',
        timer: 1500,
        showConfirmButton: false
      });
      
      this.loadTableData(this.currentPage);
    } catch (error) {
      console.error('Error deleting:', error);
      await Swal.fire({
        title: 'Error!',
        text: 'Error deleting row: ' + error.message,
        icon: 'error',
        background: '#343a40',
        color: '#ffffff'
      });
    }
  },

  editRow(id) {
    this.openEditModal(id);
  },

  exportToExcel() {
    if (this.tableData.length === 0) {
      Swal.fire({
        title: 'No Data',
        text: 'There is no data to export',
        icon: 'info',
        background: '#343a40',
        color: '#ffffff'
      });
      return;
    }

    // Prepare data for export
    const exportData = this.tableData.map((row, index) => {
      const relationshipName = row.relationship_id ? (row.relationships.name) : 'N/A';
      return {
        'S.No': index + 1,
        'Relationship': relationshipName,
        'Column 1': row.column_1 || '',
        'Column 2': row.column_2 || '',
        'Column 3': row.column_3 || '',
        'Column 4': row.column_4 || '',
        'Column 5': row.column_5 || '',
        'Column 6': row.column_6 || '',
        'Column 7': row.column_7 || '',
        'Column 8': row.column_8 || '',
        'Created At': new Date(row.created_at).toLocaleString()
      };
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Country Monitored Relationships');
    
    // Generate filename with current date
    const now = new Date();
    const filename = `country_monitored_relationships_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
  }
};