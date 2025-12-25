/* --- RESUME BUILDER PRO STYLES --- */

/* Input Layout */
.input-group { margin-bottom: 25px; border-bottom: 1px solid var(--border); padding-bottom: 15px; }
.group-title { color: var(--primary); font-size: 0.9rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
.input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ai-box { margin-bottom: 10px; }

/* Color Picker */
.color-picker-row { display: flex; gap: 10px; margin-top: 10px; }
.c-dot { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.2); transition: 0.2s; }
.c-dot:hover { transform: scale(1.1); border-color: white; }
.c-blue { background: linear-gradient(135deg, #2563eb, #06b6d4); }
.c-green { background: linear-gradient(135deg, #10b981, #84cc16); }
.c-purple { background: linear-gradient(135deg, #7c3aed, #d946ef); }
.c-gold { background: linear-gradient(135deg, #d97706, #fbbf24); }
.c-dark { background: linear-gradient(135deg, #1f2937, #4b5563); }

/* === A4 RESUME PAPER DESIGN === */
.resume-paper {
    width: 210mm; min-height: 297mm; background: #fff; color: #333;
    font-family: 'Outfit', sans-serif; /* Modern Font */
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Theme Variables (Default Blue) */
.resume-paper.theme-blue { --accent: #2563eb; --accent-grad: linear-gradient(90deg, #2563eb, #06b6d4); }
.resume-paper.theme-green { --accent: #059669; --accent-grad: linear-gradient(90deg, #059669, #84cc16); }
.resume-paper.theme-purple { --accent: #7c3aed; --accent-grad: linear-gradient(90deg, #7c3aed, #d946ef); }
.resume-paper.theme-gold { --accent: #d97706; --accent-grad: linear-gradient(90deg, #d97706, #fbbf24); }
.resume-paper.theme-dark { --accent: #1f2937; --accent-grad: linear-gradient(90deg, #1f2937, #6b7280); }

/* Header Design */
.res-header {
    background: #f8fafc; padding: 40px; border-bottom: 4px solid;
    border-image: var(--accent-grad) 1;
    display: flex; justify-content: space-between; align-items: center;
}
.res-header h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -1px; line-height: 1; color: #1e293b; text-transform: uppercase; }
.accent-text { color: var(--accent); font-weight: 600; font-size: 0.9rem; letter-spacing: 2px; margin-top: 5px; }

.header-contact { display: flex; flex-direction: column; gap: 4px; text-align: right; font-size: 0.8rem; color: #64748b; }
.header-contact i { color: var(--accent); margin-right: 5px; }

/* Body Layout */
.res-body { display: flex; flex: 1; padding: 30px 40px; gap: 30px; }
.col-left { width: 35%; border-right: 1px solid #e2e8f0; padding-right: 20px; }
.col-right { width: 65%; }

/* Sections */
.section-block { margin-bottom: 30px; }
.section-title {
    font-size: 0.85rem; font-weight: 700; color: #1e293b;
    border-bottom: 2px solid var(--accent); display: inline-block;
    padding-bottom: 3px; margin-bottom: 15px; letter-spacing: 1px;
}

#res-summary { font-size: 0.9rem; line-height: 1.6; color: #475569; text-align: justify; }

/* Skills */
.skills-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.res-skill-tag {
    background: #f1f5f9; color: #334155; padding: 4px 10px;
    border-radius: 4px; font-size: 0.75rem; font-weight: 600;
}

/* Jobs */
.job-item { margin-bottom: 20px; }
.job-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px; }
.job-head h3 { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
.job-date { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
.job-desc { font-size: 0.9rem; color: #475569; line-height: 1.5; }

/* Footer Gradient */
.res-footer-bar { height: 10px; background: var(--accent-grad); margin-top: auto; }
