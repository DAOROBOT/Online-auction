export default function AppliedFilter({products, selectedCategory, priceRange, orderBy}){
    if(selectedCategory){
        filteredProducts = products.filter(product => product.category === (selectedCategory === "All" ? product.category : selectedCategory));
    }
    if(priceRange.min){
        filteredProducts = filteredProducts.filter(product => product.currentPrice >= parseFloat(priceRange.min));
    }
    if(priceRange.max){
        filteredProducts = filteredProducts.filter(product => product.currentPrice <= parseFloat(priceRange.max));
    }
    if(orderBy === "priceLowToHigh"){
        filteredProducts = filteredProducts.sort((a,b) => a.currentPrice - b.currentPrice);
    }
    else if(orderBy === "priceHighToLow"){
        filteredProducts = filteredProducts.sort((a,b) => b.currentPrice - a.currentPrice);
    }
    else if(orderBy === "popularity"){
        filteredProducts = filteredProducts.filter(product => product.currentBid > POPULARITY_THRESHOLD);
    }
    return filteredProducts;
}