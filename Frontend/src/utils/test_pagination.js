
// Simple verification script for Pagination logic safe-guards

function testPaginationLogic(currentPage, totalItems, itemsPerPage) {
    console.log(`\nTesting: Page ${currentPage}, Total ${totalItems}, Limit ${itemsPerPage}`);

    // Defensive coding simulation
    const safeCurrentPage = Number(currentPage) || 1;
    const safeItemsPerPage = Number(itemsPerPage) || 10;
    const safeTotalItems = Number(totalItems) || 0;

    const rawStart = (safeCurrentPage - 1) * safeItemsPerPage + 1;
    const rawEnd = Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems);

    const startItem = safeTotalItems === 0 ? 0 : rawStart;
    const endItem = safeTotalItems === 0 ? 0 : rawEnd;

    console.log(`Result: Showing ${startItem} to ${endItem} of ${safeTotalItems}`);

    if (isNaN(startItem) || isNaN(endItem)) {
        console.error('FAIL: NaN detected!');
    } else {
        console.log('PASS: No NaN');
    }
}

// Test Cases
testPaginationLogic(1, 57, 10);      // Normal
testPaginationLogic(1, undefined, 10); // Undefined total
testPaginationLogic(1, 0, 10);       // Empty total
testPaginationLogic('2', '100', '20'); // String inputs
testPaginationLogic(NaN, NaN, NaN);    // Garbage inputs
