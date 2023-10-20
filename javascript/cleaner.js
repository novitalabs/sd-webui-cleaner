(function () {
    var hasApplied = false;
    onUiUpdate(function () {
        if (!hasApplied) {
            if (typeof window.applyZoomAndPan === "function") {
                hasApplied = true;
                applyZoomAndPan("#cleanup_img2maskimg");
            }
        }
    });

    onUiLoaded(function () {
        createSendToCleanerButtonSegmentAnything("txt2img_script_container");

        createSendToCleanerButton("image_buttons_txt2img", window.txt2img_gallery);
        createSendToCleanerButton("image_buttons_img2img", window.img2img_gallery);
        createSendToCleanerButton("image_buttons_extras", window.extras_gallery);

        function createSendToCleanerButtonSegmentAnything(queryId) {
            let container = gradioApp().querySelector(`#${queryId}`);

            if (!container) {
                return;
            }

            let spans = container.getElementsByTagName('span');
            let targetSpan = null;

            for (let span of spans) {
                if (span.textContent.trim() === 'Segment Anything') {
                    targetSpan = span;
                    break;
                }
            }

            if (!targetSpan) {
                return;
            }

            let parentDiv = targetSpan.parentElement;
            let segmentAnythingDiv = parentDiv.nextElementSibling;

            if (segmentAnythingDiv && segmentAnythingDiv.tagName === 'DIV') {
                let tabsDiv = segmentAnythingDiv.querySelector('.tabs');

                if (tabsDiv) {
                    let grandchildren = [];

                    for (let child of tabsDiv.children) {
                        grandchildren.push(...child.children);
                    }

                    let targetButton = grandchildren[grandchildren.length - 1];

                    if (targetButton && targetButton.tagName === 'BUTTON') {
                        const newButton = targetButton.cloneNode(true);

                        newButton.title = "Send mask to Cleaner"
                        newButton.textContent = "Send mask to Cleaner";
                        newButton.addEventListener("click", () => sendSegmentAnythingSourceMask(segmentAnythingDiv));

                        targetButton.parentNode.appendChild(newButton);
                    }
                }
            }
        }

        function getSegmentAnythingMask(container) {
            let chooseIndex = getChooseMaskIndex(container);

            let maskGridDiv = container.querySelector(".grid-container");

            let chooseMaskButton = maskGridDiv.children[chooseIndex + 3];

            let chooseMaskImg = chooseMaskButton.querySelector("img");

            let chooseMaskImgSrc = chooseMaskImg.src;

            let targetExpandMaskSpan = findSpanNode(container, "Expand Mask");

            if (targetExpandMaskSpan) {
                let checkbox = targetExpandMaskSpan.parentNode.children[0];

                if (checkbox.checked) {
                    let targetExpandMaskInfoSpan = findSpanNode(container, "Specify the amount that you wish to expand the mask by (recommend 30)");

                    let parentDiv = targetExpandMaskInfoSpan.parentNode.parentNode.parentNode.parentNode.parentNode;

                    let expandMaskDiv = parentDiv.nextElementSibling;

                    let gridContainer = expandMaskDiv.querySelector(".grid-container");

                    if (gridContainer) {
                        let expandMaskButton = gridContainer.children[1];

                        let expandMaskImg = expandMaskButton.querySelector("img");

                        chooseMaskImgSrc = expandMaskImg.src;
                    }
                }
            }

            return chooseMaskImgSrc;
        }

        function sendSegmentAnythingSourceMask(container) {
            let inputImg = container.querySelector('#txt2img_sam_input_image div[data-testid="image"] img');

            let inputImgSrc = inputImg.src;

            let chooseMaskImgSrc = getSegmentAnythingMask(container);

            switchToCleanerTag(true);

            fetch(chooseMaskImgSrc)
                .then(response => response.blob())
                .then(blob => {
                    let maskContainer = gradioApp().querySelector("#cleanup_img_inpaint_mask");

                    const imageElems = maskContainer.querySelectorAll('div[data-testid="image"]')

                    if (imageElems) {
                        const dt = new DataTransfer();
                        dt.items.add(new File([blob], "maskImage.png"));
                        updateGradioImage(imageElems[0], dt);
                    }
                })
                .catch(error => {
                    console.error("Error fetching image:", error);
                });

            let cleanupContainer = gradioApp().querySelector("#cleanup_img_inpaint_base");

            const imageElems = cleanupContainer.querySelectorAll('div[data-testid="image"]')

            if (imageElems) {
                const dt = new DataTransfer();
                dt.items.add(dataURLtoFile(inputImgSrc, "segmentAnythingInput.png"));
                updateGradioImage(imageElems[0], dt);
            }
        }

        function getChooseMaskIndex(container) {
            let chooseMaskSpans = container.getElementsByTagName('span');

            let targetChooseMaskSpan = null;

            for (let span of chooseMaskSpans) {
                if (span.textContent.trim() === 'Choose your favorite mask:') {
                    targetChooseMaskSpan = span;
                    break;
                }
            }

            let selectedIndex = -1;

            if (targetChooseMaskSpan) {
                let chooseMaskIndexDiv = targetChooseMaskSpan.nextElementSibling;

                let labels = chooseMaskIndexDiv.children;

                for (let i = 0; i < labels.length; i++) {
                    if (labels[i].classList.contains('selected')) {
                        selectedIndex = i;
                        break;
                    }
                }
            }

            return selectedIndex;
        }

        function createSendToCleanerButton(queryId, gallery) {
            const existingButton = gradioApp().querySelector(`#${queryId} button`);
            const newButton = existingButton.cloneNode(true);

            newButton.style.display = "flex";
            newButton.id = `${queryId}_send_to_cleaner`;
            newButton.addEventListener("click", () => sendImageToCleaner(gallery));
            newButton.title = "Send to Cleaner"
            newButton.textContent = "\u{1F9F9}";

            existingButton.parentNode.appendChild(newButton);
        }

        function switchToCleanerTag(cleanupMaskTag) {
            const tabIndex = getCleanerTabIndex();

            gradioApp().querySelector('#tabs').querySelectorAll('button')[tabIndex - 1].click();

            if (cleanupMaskTag) {
                let buttons = gradioApp().querySelectorAll(`#tab_cleaner_tab button`);

                let targetButton = null;

                for (let button of buttons) {
                    if (button.textContent.trim() === 'Clean up upload') {
                        targetButton = button;
                        break;
                    }
                }

                if (targetButton) {
                    targetButton.click();
                }
            }
        }

        function sendImageToCleaner(gallery) {
            const img = gallery.querySelector(".preview img");

            if (img) {
                const imgUrl = img.src;

                switchToCleanerTag(false);

                fetch(imgUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        let container = gradioApp().querySelector("#cleanup_img2maskimg");

                        const imageElems = container.querySelectorAll('div[data-testid="image"]')

                        if (imageElems) {
                            const dt = new DataTransfer();
                            dt.items.add(new File([blob], "image.png"));
                            updateGradioImage(imageElems[0], dt);
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching image:", error);
                    });
            } else {
                alert("No image selected");
            }
        }

        function updateGradioImage(element, dt) {
            let clearButton = element.querySelector("button[aria-label='Remove Image']");

            if (clearButton) {
                clearButton.click();
            }

            const input = element.querySelector("input[type='file']");

            input.value = '';
            input.files = dt.files;

            input.dispatchEvent(
                new Event('change', {
                    bubbles: true,
                    composed: true,
                })
            )
        }

        function dataURLtoFile(dataurl, filename) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }

            return new File([u8arr], filename, {type: mime});
        }

        function findSpanNode(container, text) {
            let spans = container.querySelectorAll("span");

            let targetSpan = null;

            for (let span of spans) {
                if (span.textContent.trim() === text) {
                    targetSpan = span;
                    break;
                }
            }

            return targetSpan;
        }

        function getCleanerTabIndex() {
            const tabCanvasEditorDiv = document.getElementById('tab_cleaner_tab');
            const parent = tabCanvasEditorDiv.parentNode;
            const siblings = parent.childNodes;

            let index = -1;
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i] === tabCanvasEditorDiv) {
                    index = i;
                    break;
                }
            }

            return index / 3;
        }
    });
})();