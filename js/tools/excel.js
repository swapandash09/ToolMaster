// ==========================================
// 📊 EXCEL ENGINE - TITANIUM V80 ULTIMATE
// ==========================================

let excelGlobalData = [];
let excelGlobalHeaders = [];

const Excel = {
    // --- 1. PREVIEW LOGIC ---
    preview: (input) => {
        if (!input.files[0]) return;

        const box = document.getElementById('xl-preview');
        // Show Loading State
        box.innerHTML = `
            <div style="padding:40px; text-align:center; color:var(--text-muted);">
                <i class="ri-loader-4-line" style="animation:spin 1s infinite linear; font-size:2rem;"></i>
                <p>Analyzing Data...</p>
            </div>`;
        box.classList.remove('hidden');

        const r = new FileReader();
        r.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                if (workbook.SheetNames.length === 0) throw new Error("Empty File");

                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON (Header: 1 means array of arrays)
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (!json || json.length === 0) {
                    box.innerHTML = `<p style="padding:20px; text-align:center;">Empty Sheet</p>`;
                    return;
                }

                // Store Data Globally for Export
                excelGlobalHeaders = json[0];
                excelGlobalData = json.slice(1);

                // Render Table (Limit to 100 rows for performance in preview)
                const previewRows = excelGlobalData.slice(0, 100);
                
                let html = `
                    <div style="padding:10px; font-size:0.8rem; color:var(--primary); display:flex; justify-content:space-between;">
                        <span>Total Rows: ${excelGlobalData.length}</span>
                        <span>Columns: ${excelGlobalHeaders.length}</span>
                    </div>
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem; color:var(--text);">
                        <thead>
                            <tr style="background:var(--card-hover); color:var(--primary);">
                                ${excelGlobalHeaders.map(h => `<th style="padding:10px; border:1px solid var(--border); text-align:left; white-space:nowrap;">${h || ''}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${previewRows.map((row, i) => `
                                <tr style="background:${i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'};">
                                    ${excelGlobalHeaders.map((_, j) => `<td style="padding:8px; border:1px solid var(--border);">${row[j] || ''}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${excelGlobalData.length > 100 ? `<p style="text-align:center; padding:10px; opacity:0.7; font-size:0.8rem;">Showing first 100 rows. Full data will be exported.</p>` : ''}
                `;

                box.innerHTML = html;

            } catch (err) {
                console.error(err);
                box.innerHTML = `<p style="padding:20px; text-align:center; color:#ef4444;">Error reading file.</p>`;
            }
        };
        r.readAsArrayBuffer(input.files[0]);
    },

    // --- 2. CONVERT TO PDF (V80 ENGINE) ---
    convert: async () => {
        if (!excelGlobalHeaders.length) {
            alert("Please upload an Excel file first!");
            return;
        }

        const btn = document.querySelector('#excel-tool .glow-btn');
        const originalText = btn.innerText;
        btn.innerText = "Generating PDF...";
        btn.disabled = true;

        try {
            // Create a temporary "Clean" container for PDF generation
            // This bypasses dark mode issues and screen size limitations
            const printArea = document.createElement('div');
            
            // Smart Orientation: Landscape if > 5 cols
            const isLandscape = excelGlobalHeaders.length > 5;
            const width = isLandscape ? 1123 : 794; // A4 Dimensions in px (approx)

            printArea.style.cssText = `
                position: fixed; top: 0; left: 0; 
                width: ${width}px; min-height: 100vh;
                background: white; color: black; 
                padding: 40px; box-sizing: border-box; 
                z-index: 99999; font-family: sans-serif;
            `;

            // Build Clean HTML Table
            const date = new Date().toLocaleDateString();
            printArea.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #000; padding-bottom:10px; margin-bottom:20px;">
                    <div>
                        <h1 style="margin:0; font-size:24px; color:#000;">Data Export</h1>
                        <p style="margin:0; font-size:12px; color:#666;">Generated by Titanium V80</p>
                    </div>
                    <div style="font-size:12px; color:#666;">${date}</div>
                </div>
                <table style="width:100%; border-collapse:collapse; font-size:10px;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            ${excelGlobalHeaders.map(h => `<th style="border:1px solid #ddd; padding:6px; text-align:left;">${h || ''}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${excelGlobalData.map((row, i) => `
                            <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};">
                                ${excelGlobalHeaders.map((_, j) => `<td style="border:1px solid #ddd; padding:6px;">${row[j] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            document.body.appendChild(printArea);

            // PDF Config
            const opt = {
                margin: 10,
                filename: `Excel_Export_${Date.now()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, // High Res
                    scrollY: 0, 
                    useCORS: true,
                    windowWidth: width
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: isLandscape ? 'landscape' : 'portrait' 
                }
            };

            await html2pdf().set(opt).from(printArea).save();

            // Cleanup
            document.body.removeChild(printArea);

        } catch (e) {
            console.error(e);
            alert("PDF Generation Failed.");
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
};

// CSS Animation for loader
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);
