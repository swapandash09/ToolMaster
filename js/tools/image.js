// MAGIC ERASER & IMAGE TOOLS

// 1. Magic Eraser
const bgInput = document.getElementById('bg-input');
if(bgInput) {
    bgInput.addEventListener('change', async (e) => {
        loader(true);
        const img = new Image();
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = async () => {
            document.getElementById('bg-original-img').src = img.src;
            try {
                const { removeBackground } = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
                const blob = await removeBackground(img.src);
                const url = URL.createObjectURL(blob);
                document.getElementById('bg-result-img').src = url;
                
                document.getElementById('compare-container').classList.remove('hidden');
                document.getElementById('dl-bg-btn').classList.remove('hidden');
                document.getElementById('dl-bg-btn').onclick = () => {
                    const a = document.createElement('a'); a.href = url; a.download = 'no-bg.png'; a.click();
                };
            } catch(e) { showToast("AI Error"); }
            loader(false);
        }
    });
}

window.slideCompare = (val) => {
    document.getElementById('bg-original-img').style.clipPath = `inset(0 ${100-val}% 0 0)`;
}

// 2. Compressor (Simplified for modularity)
window.liveCompress = () => {
    const input = document.getElementById('img-input');
    if(!input.files[0]) return showToast("Select Image");
    
    const q = document.getElementById('quality').value;
    const img = new Image();
    img.src = URL.createObjectURL(input.files[0]);
    img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        cvs.getContext('2d').drawImage(img,0,0);
        document.getElementById('comp-prev').src = cvs.toDataURL('image/jpeg', parseFloat(q));
    }
}
