document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("grid");
    const buttons = document.querySelectorAll("#controls button");

    // Constants for line thickness
    const inactiveThickness = 2;  // thin
    const activeThickness = 4;    // thicker
    const cellSize = 50;          // each cell is 50px square

    grid.dataset.cellSize = cellSize;

    /**
     * Positions and sizes a vertical or horizontal edge so that it overlaps
     * adjacent edges at the corners by half its thickness, preventing gaps.
     */
    function setEdgeGeometry(edge, thickness) {
        const orientation = edge.dataset.orientation;
        const row = parseInt(edge.dataset.row, 10);
        const col = parseInt(edge.dataset.col, 10);
        const size = parseInt(grid.dataset.size, 10);
        const cell = parseInt(grid.dataset.cellSize, 10);

        if (orientation === "vertical") {
            // Overlap half thickness above and below
            edge.style.width = thickness + "px";
            edge.style.height = (cell + thickness) + "px";
            edge.style.left = (col * cell - thickness / 2) + "px";
            edge.style.top = (row * cell - thickness / 2) + "px";
        } else {
            // horizontal
            // Overlap half thickness on the left and right
            edge.style.width = (cell + thickness) + "px";
            edge.style.height = thickness + "px";
            edge.style.left = (col * cell - thickness / 2) + "px";
            edge.style.top = (row * cell - thickness / 2) + "px";
        }
    }

    // Updates an edge's geometry based on its active state
    function updateEdgeStyle(edge) {
        const isActive = edge.classList.contains("active");
        const thickness = isActive ? activeThickness : inactiveThickness;
        setEdgeGeometry(edge, thickness);
    }

    // Toggle the edge's active state and update geometry
    function toggleEdge(edge) {
        edge.classList.toggle("active");
        updateEdgeStyle(edge);
    }

    /**
     * Creates the grid for the given size.
     * Only internal edges (col = 1..size-1, row = 1..size-1) are created.
     */
    function createGrid(size) {
        grid.dataset.size = size;
        const totalSize = cellSize * size;
        grid.style.width = totalSize + "px";
        grid.style.height = totalSize + "px";

        // Clear any previous grid elements
        grid.innerHTML = "";

        // Create vertical internal edges
        for (let col = 1; col < size; col++) {
            for (let row = 0; row < size; row++) {
                const vEdge = document.createElement("div");
                vEdge.classList.add("edge");
                vEdge.dataset.orientation = "vertical";
                vEdge.dataset.row = row;
                vEdge.dataset.col = col;
                // Initially not active
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
        for (let row = 1; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const hEdge = document.createElement("div");
                hEdge.classList.add("edge");
                hEdge.dataset.orientation = "horizontal";
                hEdge.dataset.row = row;
                hEdge.dataset.col = col;
                // Initially not active
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
     * Click anywhere on the grid container (not on an edge) toggles
     * the nearest internal edge in the clicked cell.
     */
    grid.addEventListener("click", function(e) {
        if (e.target === grid) {
            const size = parseInt(grid.dataset.size, 10);
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
            if (minDist === distLeft && col > 0) {
                // Left boundary
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="vertical"][data-col="${col}"][data-row="${row}"]`
                );
            } else if (minDist === distRight && col < size - 1) {
                // Right boundary
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="vertical"][data-col="${col + 1}"][data-row="${row}"]`
                );
            } else if (minDist === distTop && row > 0) {
                // Top boundary
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="horizontal"][data-row="${row}"][data-col="${col}"]`
                );
            } else if (minDist === distBottom && row < size - 1) {
                // Bottom boundary
                candidateEdge = grid.querySelector(
                  `.edge[data-orientation="horizontal"][data-row="${row + 1}"][data-col="${col}"]`
                );
            }

            if (candidateEdge) {
                toggleEdge(candidateEdge);
            }
        }
    });

    // Button listeners
    buttons.forEach(button => {
        button.addEventListener("click", function() {
            const size = parseInt(this.getAttribute("data-size"), 10);
            createGrid(size);
        });
    });

    // Initialize with a default 7x7 grid
    createGrid(7);
});
