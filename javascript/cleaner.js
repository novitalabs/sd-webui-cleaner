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
})();