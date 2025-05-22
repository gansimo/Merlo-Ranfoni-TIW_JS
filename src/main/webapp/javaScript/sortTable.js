(function () {
    //get text contet of a specific cell
    function getCellValue(tr, idx) {
        return tr.children[idx].textContent;
    }

    //comparing rows basing on idx and asc
    function createComparer(idx, asc) {
        return function (a, b) {
            //comparing a and b basing on the asc/desc value
            var v1 = getCellValue(asc ? a : b, idx);
            var v2 = getCellValue(asc ? b : a, idx);

            //handling empty values
            if (v1 === '' || v2 === '') {
                return v1.toString().localeCompare(v2);
            }

            var num1 = parseFloat(v1);
            var num2 = parseFloat(v2);

            //number comparison if both numbers
            if (!isNaN(num1) && !isNaN(num2)) {
                return num1 - num2;
            }

            //string comp otherwise
            return v1.toString().localeCompare(v2);
        };
    }

    //making the input table sortable
    function makeSortable(table) {
        const headers = table.querySelectorAll('th');

        headers.forEach(function (th, index) {
            //skipping the last column (buttons)
            if (index === headers.length - 1) {
                return;
            }

            //new header container to add sort features
            const headerContainer = document.createElement('div');
            headerContainer.className = 'header-container';

            //moving text into the span
            const textSpan = document.createElement('span');
            textSpan.textContent = th.textContent;

            //sorting arrows container
            const arrowsContainer = document.createElement('div');
            arrowsContainer.className = 'arrows-container';

            const upArrow = document.createElement('span');
            upArrow.textContent = '▲';
            upArrow.className = 'sort-arrow';

            const downArrow = document.createElement('span');
            downArrow.textContent = '▼';
            downArrow.className = 'sort-arrow';

            //adding rows to the container
            arrowsContainer.appendChild(upArrow);
            arrowsContainer.appendChild(downArrow);

            //adding text and arrows container to the header cont
            headerContainer.appendChild(textSpan);
            headerContainer.appendChild(arrowsContainer);

            //clear the moved text in the th
            th.textContent = '';
            th.appendChild(headerContainer);

            //registering click events
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

    function sortTable(header, ascending) {
        const table = header.closest('table');
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const index = Array.from(header.parentNode.children).indexOf(header);

        rows.sort(createComparer(index, ascending));

        rows.forEach(function (tr) {
            tbody.appendChild(tr);
        });
    }

    function updateArrowColors(header, ascending) {
        const table = header.closest('table');
        const allArrows = table.querySelectorAll('.sort-arrow');
		//reset all arrows
        allArrows.forEach(arrow => {
            arrow.classList.remove('active');
        });

        //coloring the clicked arrow
        const arrows = header.querySelectorAll('.sort-arrow');
        if (ascending) {
            arrows[0].classList.add('active'); //up
        } else {
            arrows[1].classList.add('active'); //down
        }
    }

    //exporting func
    window.tableSorter = {
        makeSortable: makeSortable
    };
})(); 