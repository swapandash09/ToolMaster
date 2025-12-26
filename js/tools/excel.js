// ==========================================
// 📊 EXCEL TO PDF PRO V2 - ULTRA HD & SMART CLEANING
// ==========================================

const excelInput = document.getElementById('excel-input');

if (excelInput) {
    excelInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (typeof loader === 'function') loader(true);

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = (ev) => {
            try {
                const data = new Uint8Array(ev.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];

                // Step 1: Convert to 2D array
                let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

                // Step 2: SMART CLEANING - Remove empty rows & columns
                // Remove completely empty rows
                jsonData = jsonData.filter(row => 
                    row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== "")
                );

                // Find actual used columns (skip trailing empty cols)
                if (jsonData.length > 0) {
                    const maxCols = Math.max(...jsonData.map(row => row.length));
                    const colHasData = Array(maxCols).fill(false);

                    jsonData.forEach(row => {
                        row.forEach((cell, i) => {
                            if (cell !== null && cell !== undefined && cell.toString().trim() !== "") {
                                colHasData[i] = true;
                            }
                        });
                    });

                    // Filter columns
                    jsonData = jsonData.map(row => {
                        return row.filter((_, i) => colHasData[i] || i < Math.min(...colHasData.map((v, idx) => v ? idx + 1 : 0)));
                    });
                }

                // Step 3: Auto-detect orientation
                const rowCount = jsonData.length;
                const colCount = jsonData[0]?.length || 1;
                const suggestedOrientation = (colCount > 8 || colCount > rowCount) ? 'landscape' : 'portrait';

                // Update orientation dropdown suggestion
                const orientSelect = document.getElementById('pdf-orient');
                if (orientSelect && orientSelect.value === 'auto') {
                    orientSelect.value = suggestedOrientation;
                }

                // Step 4: Generate cleaned sheet & HTML preview
                const newSheet = XLSX.utils.aoa_to_sheet(jsonData);
                const html = XLSX.utils.sheet_to_html(newSheet, { id: 'excel-table' });

                const container = document.getElementById('excel-preview-container');
                if (container) {
                    container.innerHTML = html;

                    // Enhanced preview styling
                    const table = container.querySelector('#excel-table');
                    if (table) {
                        table.style.width = '100%';
                        table.style.borderCollapse = 'collapse';
                        table.style.fontSize = '14px';
                        table.style.background = 'var(--card)';
                        table.style.borderRadius = '12px';
                        table.style.overflow = 'hidden';
                        table.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';

                        table.querySelectorAll('td, th').forEach(cell => {
                            cell.style.padding = '12px';
                            cell.style.border = '1px solid var(--border)';
                            cell.style.textAlign = 'left';
                            cell.style.background = 'transparent';
                        });

                        // Style header row
                        table.querySelectorAll('tr:first-child th').forEach(th => {
                            th.style.background = 'var(--primary)';
                            th.style.color = 'white';
                            th.style.fontWeight = '600';
                        });
                    }
                }

                if (typeof showToast === 'function') {
                    showToast(`Excel Loaded! ${rowCount} rows × ${colCount} cols cleaned.`, "success");
                }

            } catch (err) {
                console.error("Excel parse error:", err);
                if (typeof showToast === 'function') showToast("Invalid Excel file!", "error");
            } finally {
                if (typeof loader === 'function') loader(false);
            }
        };
    });
}

window.generateUltraHDPDF = () => {
    const el = document.getElementById('excel-table');
    if (!el) {
        if (typeof showToast === 'function') showToast("Please upload an Excel file first!", "error");
        return;
    }

    if (typeof loader === 'function') loader(true);

    // Clone and prepare
    const clone = el.cloneNode(true);
    const useBorder = document.getElementById('pdf-border')?.checked ?? true;
    let orient = document.getElementById('pdf-orient')?.value || 'auto';
    
    // Auto orientation fallback
    const colCount = clone.querySelector('tr')?.children.length || 1;
    if (orient === 'auto') {
        orient = colCount > 8 ? 'landscape' : 'portrait';
    }

    // Ultra HD Styling
    clone.style.width = '100%';
    clone.style.fontFamily = "'Outfit', Arial, Helvetica, sans-serif";
    clone.style.background = '#ffffff';
    clone.style.color = '#1f2937';

    // Auto column width calculation
    const rows = clone.querySelectorAll('tr');
    const colWidths = [];

    rows.forEach(row => {
        row.querySelectorAll('td, th').forEach((cell, i) => {
            const text = cell.textContent || "";
            const length = text.length;
            colWidths[i] = Math.max(colWidths[i] || 0, length);
        });
    });

    // Apply smart column widths
    rows.forEach(row => {
        row.querySelectorAll('td, th').forEach((cell, i) => {
            const baseWidth = Math.max(80, colWidths[i] * 7); // Min 80px, ~7px per char
            cell.style.minWidth = `${baseWidth}px`;
            cell.style.maxWidth = `${baseWidth * 1.5}px`;
            cell.style.wordWrap = 'break-word';
            cell.style.overflow = 'hidden';
            cell.style.padding = '10px 12px';
            cell.style.fontSize = '13px';
            cell.style.lineHeight = '1.4';
            cell.style.border = useBorder ? '1px solid #333333' : 'none';
            cell.style.background = '#ffffff';
        });
    });

    // Header styling
    clone.querySelectorAll('tr:first-child th').forEach(th => {
        th.style.background = '#4f46e5';
        th.style.color = 'white';
        th.style.fontWeight = '700';
        th.style.fontSize = '14px';
    });

    // Off-screen wrapper
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.style.background = '#ffffff';
    wrapper.style.padding = '40px';
    wrapper.style.width = orient === 'portrait' ? '794px' : '1123px'; // A4 @ 96dpi base
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Ultra HD PDF Options
    const opt = {
        margin: [15, 15, 15, 15],
        filename: `Excel_Export_UltraHD_${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'png', quality: 1.0 },
        html2canvas: {
            scale: 4,                    // 4x = True Ultra HD
            useCORS: true,
            letterRendering: true,
            logging: false,
            dpi: 300,                    // Force high DPI
            scrollX: 0,
            scrollY: 0,
            windowWidth: orient === 'portrait' ? 900 : 1300
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: orient
        }
    };

    // Generate PDF
    html2pdf().set(opt).from(wrapper).save().then(() => {
        document.body.removeChild(wrapper);
        if (typeof loader === 'function') loader(false);
        if (typeof showToast === 'function') showToast("Ultra HD PDF Generated! 🎉", "success");
    }).catch(err => {
        console.error("PDF Error:", err);
        document.body.removeChild(wrapper);
        if (typeof loader === 'function') loader(false);
        if (typeof showToast === 'function') showToast("PDF generation failed!", "error");
    });
};
