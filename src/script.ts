import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(Draggable, InertiaPlugin);

const $dropZone = document.querySelector('.drop-zone') as HTMLElement;
const $dropZoneHighlight = document.querySelector('.drop-zone-highlight') as HTMLElement;
const $content = document.querySelector('.content') as HTMLElement;
const $instructions = document.querySelector('.instructions') as HTMLElement;

function displayImagePreview(imageUrl: string): void {
    const $img = document.createElement('img');
    $img.src = imageUrl;
    $img.style.height = '100vh';
    $content.appendChild($img);

    const draggable = Draggable.create($img, {
        type: 'x,y',
        bounds: $content,
        inertia: true,
        throwResistance: 5000
    })[0];

    $dropZoneHighlight.style.display = 'none';

    setTimeout(() => {
        const centerX = ($content.offsetWidth - $img.offsetWidth) / 2;
        const centerY = ($content.offsetHeight - $img.offsetHeight) / 2;
        gsap.set($img, { x: centerX, y: centerY });

        // Zoom settings
        let currentScale = 1;
        const minScale = 1;
        const maxScale = 3;
        const zoomSpeed = 0.1;

        // Add zoom functionality
        $content.addEventListener('wheel', (e) => {
            e.preventDefault();

            // Get mouse position relative to container
            const rect = $content.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Get element position relative to container
            const elementRect = $img.getBoundingClientRect();
            const elementX = elementRect.left - rect.left;
            const elementY = elementRect.top - rect.top;

            // Calculate mouse position relative to element center
            const elementCenterX = elementX + elementRect.width / 2;
            const elementCenterY = elementY + elementRect.height / 2;

            // Calculate zoom
            const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
            const newScale = Math.min(Math.max(currentScale + delta, minScale), maxScale);

            if (newScale !== currentScale) {
                // Calculate the offset to zoom towards mouse position
                const scaleRatio = newScale / currentScale;

                // Get current transform
                const currentX = gsap.getProperty($img, "x") as number;
                const currentY = gsap.getProperty($img, "y") as number;

                // Calculate new position to zoom towards mouse
                const offsetX = (mouseX - elementCenterX) * (1 - scaleRatio);
                const offsetY = (mouseY - elementCenterY) * (1 - scaleRatio);

                // Apply transform
                gsap.set($img, {
                    scale: newScale,
                    x: currentX + offsetX,
                    y: currentY + offsetY
                });

                currentScale = newScale;

                // Update draggable bounds if needed
                draggable.update(true);
            }
        });

        $content.addEventListener('dblclick', (e) => {
            // Get mouse position relative to container
            const rect = $content.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Get element position relative to container
            const elementRect = $img.getBoundingClientRect();
            const elementX = elementRect.left - rect.left;
            const elementY = elementRect.top - rect.top;

            // Calculate mouse position relative to element center
            const elementCenterX = elementX + elementRect.width / 2;
            const elementCenterY = elementY + elementRect.height / 2;

            // Calculate zoom
            const newScale = currentScale > 1 ? 1 : 3;

            if (newScale !== currentScale) {
                // Calculate the offset to zoom towards mouse position
                const scaleRatio = newScale / currentScale;

                // Get current transform
                const currentX = gsap.getProperty($img, "x") as number;
                const currentY = gsap.getProperty($img, "y") as number;

                // Calculate new position to zoom towards mouse
                const offsetX = (mouseX - elementCenterX) * (1 - scaleRatio);
                const offsetY = (mouseY - elementCenterY) * (1 - scaleRatio);

                // Apply transform
                gsap.to($img, {
                    scale: newScale,
                    x: currentX + offsetX,
                    y: currentY + offsetY,
                    onUpdate: () => {
                        draggable.update(true);
                    }
                });

                currentScale = newScale;
            }
          });

          window.addEventListener('resize', () => {
            draggable.update(true);
          });
    }, 100);

    $dropZone.style.pointerEvents = 'none';
    $instructions.style.display = 'block';

}

function removeImagePreview(): void {
    const img = $content.querySelector('img');
    if (img) {
        img.remove();
    }
}

$dropZone.addEventListener('dragenter', () => {
    console.log('dragenter');
    $dropZoneHighlight.style.display = 'block';
});

$dropZone.addEventListener('dragleave', () => {
    console.log('dragleave');
    $dropZoneHighlight.style.display = 'none';
});

$dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
});

$dropZone.addEventListener('drop', async(e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer?.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    for (const file of imageFiles) {
        try {
            const imageUrl = URL.createObjectURL(file);
            removeImagePreview();
            displayImagePreview(imageUrl);
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
        }
    }
});