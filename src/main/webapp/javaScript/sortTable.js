(function () {
    // Returns the text content of a cell
    function getCellValue(tr, idx) {
        return tr.children[idx].textContent;
    }

    // Creates a function that compares two rows based on the cell in the idx position
    function createComparer(idx, asc) {
        return function (a, b) {
            // Get values to compare at column idx
            var v1 = getCellValue(asc ? a : b, idx);
            var v2 = getCellValue(asc ? b : a, idx);

            // Handle empty values
            if (v1 === '' || v2 === '') {
                return v1.toString().localeCompare(v2);
            }

            // Try to convert to numbers for numeric comparison
            var num1 = parseFloat(v1);
            var num2 = parseFloat(v2);

            // If both values are numbers, compare them numerically
            if (!isNaN(num1) && !isNaN(num2)) {
                return num1 - num2;
            }

            // Otherwise, compare as strings
            return v1.toString().localeCompare(v2);
        };
    }

    // Function to create sortable headers
    function makeSortable(table) {
        const headers = table.querySelectorAll('th');

        headers.forEach(function (th, index) {
            // Skip the last column (Azioni)
            if (index === headers.length - 1) {
                return;
            }

            // Create container for header text and arrows
            const headerContainer = document.createElement('div');
            headerContainer.className = 'header-container';

            // Move the original text to a span
            const textSpan = document.createElement('span');
            textSpan.textContent = th.textContent;

            // Create arrows container
            const arrowsContainer = document.createElement('div');
            arrowsContainer.className = 'arrows-container';

            // Create up arrow
            const upArrow = document.createElement('span');
            upArrow.textContent = '▲';
            upArrow.className = 'sort-arrow';

            // Create down arrow
            const downArrow = document.createElement('span');
            downArrow.textContent = '▼';
            downArrow.className = 'sort-arrow';

            // Add arrows to container
            arrowsContainer.appendChild(upArrow);
            arrowsContainer.appendChild(downArrow);

            // Add text and arrows to header container
            headerContainer.appendChild(textSpan);
            headerContainer.appendChild(arrowsContainer);

            // Clear header and add the new container
            th.textContent = '';
            th.appendChild(headerContainer);

            // Add click handlers for arrows
            upArrow.addEventListener('click', function (e) {
                e.stopPropagation();
                sortTable(th, true);
                updateArrowColors(th, true);
            });

            downArrow.addEventListener('click', function (e) {
                e.stopPropagation();
                sortTable(th, false);
                updateArrowColors(th, false);
            });
        });
    }

    // Function to sort the table
    function sortTable(header, ascending) {
        const table = header.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const index = Array.from(header.parentNode.children).indexOf(header);

        // Sort the rows
        rows.sort(createComparer(index, ascending));

        // Reappend the sorted rows
        rows.forEach(function (tr) {
            tbody.appendChild(tr);
        });
    }

    // Function to update arrow colors
    function updateArrowColors(header, ascending) {
        // Reset all arrows in the table
        const table = header.closest('table');
        const allArrows = table.querySelectorAll('.sort-arrow');
        allArrows.forEach(arrow => {
            arrow.classList.remove('active');
        });

        // Highlight the clicked arrow
        const arrows = header.querySelectorAll('.sort-arrow');
        if (ascending) {
            arrows[0].classList.add('active'); // Up arrow
        } else {
            arrows[1].classList.add('active'); // Down arrow
        }
    }

    // Export the function to be used by other scripts
    window.tableSorter = {
        makeSortable: makeSortable
    };
})(); 