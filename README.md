# bricklink-scrapper
A tool using puppeteer to scrape bricklink.com for data



## Navigation

 - Category Tree
	 - Category
		 - Part
			 - Color

## Methods

**collect urls methods**
- getCategoriesFromCategoryTree() -> returns [categoryURLS]
- getPartsFromCategory(categoryCode) -> returns [partURLS]
- getColorsFromPart(partCode) -> returns [colorURLS]

**scrape method**

    scrape( [colorURLs], {options} )

 >Takes an array of colorURLs and an object of options

    options {
    	getTitle: true,
    	getSales: true,
    	output: 'csv',
    	etc... 
    }

