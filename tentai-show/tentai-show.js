document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("grid");
    const presetButtons = document.querySelectorAll("#controls button[data-width]");
    const applyCustomButton = document.getElementById("apply-custom");
    const widthInput = document.getElementById("width-input");
    const heightInput = document.getElementById("height-input");

    // Constants for line thickness
    const inactiveThickness = 2;  // thin
    const activeThickness = 4;    // thicker
    const cellSize = 50;          // each cell is 50px square

    /**
     * Positions and sizes a vertical or horizontal edge so that it overlaps
     * adjacent edges at the corners by half its thickness.
     */
    function setEdgeGeometry(edge, thickness) {
        const orientation = edge.dataset.orientation;
        const row = parseInt(edge.dataset.row, 10);
        const col = parseInt(edge.dataset.col, 10);
        const gridWidth = parseInt(grid.dataset.gridWidth, 10);
        const gridHeight = parseInt(grid.dataset.gridHeight, 10);

        // Each cell is cellSize × cellSize
        if (orientation === "vertical") {
            edge.style.width = thickness + "px";
            edge.style.height = (cellSize + thickness) + "px";
            edge.style.left = (col * cellSize - thickness / 2) + "px";
            edge.style.top = (row * cellSize - thickness / 2) + "px";
        } else {
            // horizontal
            edge.style.width = (cellSize + thickness) + "px";
            edge.style.height = thickness + "px";
            edge.style.left = (col * cellSize - thickness / 2) + "px";
            edge.style.top = (row * cellSize - thickness / 2) + "px";
        }
    }

    /**
     * Updates an edge's geometry based on its active state.
     */
    function updateEdgeStyle(edge) {
        const isActive = edge.classList.contains("active");
        const thickness = isActive ? activeThickness : inactiveThickness;
        setEdgeGeometry(edge, thickness);
    }

    /**
     * Toggles the edge's active state and updates geometry.
     */
    function toggleEdge(edge) {
        edge.classList.toggle("active");
        updateEdgeStyle(edge);
    }

    /**
     * Creates a grid of size (width × height) in cells.
     * Only internal edges are created:
     *  - Vertical edges: col = 1..width-1, row = 0..height
     *  - Horizontal edges: row = 1..height-1, col = 0..width
     */
    function createGrid(width, height) {
        // Store grid dimensions in dataset
        grid.dataset.gridWidth = width;
        grid.dataset.gridHeight = height;

        // Calculate total pixel size
        const totalWidth = cellSize * width;
        const totalHeight = cellSize * height;

        // Adjust container size
        grid.style.width = totalWidth + "px";
        grid.style.height = totalHeight + "px";

        // Clear any existing edges
        grid.innerHTML = "";

        // Create vertical internal edges
        for (let col = 1; col < width; col++) {
            for (let row = 0; row < height; row++) {
                const vEdge = document.createElement("div");
                vEdge.classList.add("edge");
                vEdge.dataset.orientation = "vertical";
                vEdge.dataset.row = row;
                vEdge.dataset.col = col;
                vEdge.classList.remove("active");
                updateEdgeStyle(vEdge);

                vEdge.addEventListener("click", function(e) {
                    toggleEdge(vEdge);
                    e.stopPropagation();
                });

                grid.appendChild(vEdge);
            }
        }

        // Create horizontal internal edges
        for (let row = 1; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const hEdge = document.createElement("div");
                hEdge.classList.add("edge");
                hEdge.dataset.orientation = "horizontal";
                hEdge.dataset.row = row;
                hEdge.dataset.col = col;
                hEdge.classList.remove("active");
                updateEdgeStyle(hEdge);

                hEdge.addEventListener("click", function(e) {
                    toggleEdge(hEdge);
                    e.stopPropagation();
                });

                grid.appendChild(hEdge);
            }
        }
    }

    /**
     * Click anywhere on the grid container (not on an edge) to toggle
     * the nearest internal edge in the clicked cell.
     */
    grid.addEventListener("click", function(e) {
        if (e.target === grid) {
            const gridWidth = parseInt(grid.dataset.gridWidth, 10);
            const gridHeight = parseInt(grid.dataset.gridHeight, 10);

            const offsetX = e.offsetX;
            const offsetY = e.offsetY;
            const col = Math.floor(offsetX / cellSize);
            const row = Math.floor(offsetY / cellSize);

            // Distances to the cell boundaries
            const distLeft = offsetX - col * cellSize;
            const distRight = (col + 1) * cellSize - offsetX;
            const distTop = offsetY - row * cellSize;
            const distBottom = (row + 1) * cellSize - offsetY;
            const minDist = Math.min(distLeft, distRight, distTop, distBottom);

            let candidateEdge = null;
            // left boundary
            if (minDist === distLeft && col > 0) {
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="vertical"][data-col="${col}"][data-row="${row}"]`
                );
            }
            // right boundary
            else if (minDist === distRight && col < gridWidth) {
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="vertical"][data-col="${col + 1}"][data-row="${row}"]`
                );
            }
            // top boundary
            else if (minDist === distTop && row > 0) {
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="horizontal"][data-row="${row}"][data-col="${col}"]`
                );
            }
            // bottom boundary
            else if (minDist === distBottom && row < gridHeight) {
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="horizontal"][data-row="${row + 1}"][data-col="${col}"]`
                );
            }

            if (candidateEdge) {
                toggleEdge(candidateEdge);
            }
        }
    });

    // Preset button listeners (for 5x5, 7x7, etc.)
    presetButtons.forEach(button => {
        button.addEventListener("click", function() {
            const w = parseInt(this.getAttribute("data-width"), 10);
            const h = parseInt(this.getAttribute("data-height"), 10);
            createGrid(w, h);
        });
    });

    // Custom "Apply" button listener
    applyCustomButton.addEventListener("click", function() {
        const w = parseInt(widthInput.value, 10) || 1;
        const h = parseInt(heightInput.value, 10) || 1;
        createGrid(w, h);
    });

    // Initialize with a default 7×7 grid
    createGrid(7, 7);
});
