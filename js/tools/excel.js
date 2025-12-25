// EXCEL TOOL V2

document.getElementById('excel-input')?.addEventListener('change', (e) => {
    loader(true);
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = (ev) => {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, {type:'array'});
        const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]], { id:'excel-table' });
        document.getElementById('excel-preview-container').innerHTML = html;
        loader(false);
    };
});

window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if(!el) return showToast("Upload File First");
    loader(true);

    const clone = el.cloneNode(true);
    const useBorder = document.getElementById('pdf-border').checked;
    const orient = document.getElementById('pdf-orient').value === 'auto' ? 'landscape' : document.getElementById('pdf-orient').value;

    clone.style.width = '100%'; clone.style.background = 'white';
    clone.querySelectorAll('td, th').forEach(td => {
        td.style.color = 'black';
        td.style.fontSize = '10px';
        td.style.padding = '4px';
        td.style.border = useBorder ? "1px solid #333" : "none";
    });

    const wrapper = document.createElement('div');
    wrapper.style.width = (orient === 'portrait' ? 700 : 1000) + 'px';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    html2pdf().set({
        margin: 5, filename: 'Sheet.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: orient }
    }).from(wrapper).save().then(() => {
        document.body.removeChild(wrapper);
        loader(false);
    });
      }
