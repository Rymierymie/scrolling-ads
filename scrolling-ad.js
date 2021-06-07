startUserAtPageTop();

// Calculating and setting styleSheet values based on browser window and creative height
// The height of each element needs to be determined by the width of the device
let numberOfSlots = 3;
let viewportWidth = window.innerWidth;
let creativeWidth = 375;
let creativeHeight = 50; // height of each piece of creative
let adHeight = creativeHeight * numberOfSlots;
let creativeSizeAdjustmentScale = viewportWidth / creativeWidth;
let requiredSlotHeight = (creativeHeight * creativeSizeAdjustmentScale).toFixed(1);
console.log(`Required Slot Height: ${requiredSlotHeight}`);

document.documentElement.style.setProperty('--ad-slot-height', `${requiredSlotHeight * numberOfSlots}px`);
document.documentElement.style.setProperty('--canvas-height', `${(requiredSlotHeight * numberOfSlots) * numberOfSlots}px`);

document.documentElement.style.setProperty('--slot-one-height', `${requiredSlotHeight}px`);
document.documentElement.style.setProperty('--slot-two-height', `${requiredSlotHeight}px`);
document.documentElement.style.setProperty('--slot-three-height', `${requiredSlotHeight}px`);

// TODO - refactor the below to be more dynamic and just better
document.documentElement.style.setProperty('--slot-one-y-axis', `${requiredSlotHeight * 1}px`);
document.documentElement.style.setProperty('--slot-two-y-axis', `${requiredSlotHeight  * 3}px`);
document.documentElement.style.setProperty('--slot-three-y-axis', `${requiredSlotHeight  * 5}px`);

// Elements for animations
let slotOne = document.getElementById('slot-one');
let slotTwo = document.getElementById('slot-two');
let slotThree = document.getElementById('slot-three'); 

// Setting global variables from stylesheet
let adSlot = document.getElementById('ad-slot')
let adSlotInnerCanvasHeight = getComputedStyle(document.documentElement).getPropertyValue('--canvas-height').split("px")[0];
let adSlotHeight = getComputedStyle(document.documentElement).getPropertyValue('--ad-slot-height').split("px")[0];
let adSlotScrollableHeight = adSlotInnerCanvasHeight - adSlotHeight;

// Creative Slot One
let slotOneXAxisStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-one-x-axis').split("px")[0];
let slotOneZAxisStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-one-z-axis').split("px")[0];
let slotOneBlurStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-one-blur').split("px")[0];

// Creative Slot Two
let slotTwoXAxisStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-two-x-axis').split("px")[0];
let slotTwoZAxisStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-two-z-axis').split("px")[0];
let slotTwoBlurStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-two-blur').split("px")[0];

// Creative Slot Three
let slotThreeXAxisStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-three-x-axis').split("px")[0];
let slotThreeZAxisStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-three-z-axis').split("px")[0];
let slotThreeBlurStartPoint = getComputedStyle(document.documentElement).getPropertyValue('--slot-three-blur').split("px")[0];

// Setting some required global variables
let animationCompleted = false; // Flag for cancelling further animation once completed

let distanceToBottomOfAdContainer = getDistanceToBottomOfAdSlot()

console.log(distanceToBottomOfAdContainer);

window.addEventListener('scroll', function (event) {  
    // Should tidy up below. Being calculated too often to account for changes in height in mobile browsers 
    distanceToBottomOfAdContainer = getDistanceToBottomOfAdSlot();
    // The ad is raised up after the user starts to scroll
    adSlot.classList.add('raise-ad')
    let stickyAdElement = document.getElementById('sticky-ad-element');
    stickyAdElement.classList.add('glow-enter');

    // Once the adSlot is in view it will stick to the bottom of the screen during animation
    if (isInViewport(adSlot)) {
        adSlot.classList.add('sticky-bottom');
    }
   
    // Keeping track of the distance from the top of page, so we can set the scroll of the ad-unit
    let distanceFromTopOfPage = window.pageYOffset
   
    if (distanceFromTopOfPage <= distanceToBottomOfAdContainer){
        let percentScrolledFromPageTopToAdUnitBottom = (distanceFromTopOfPage/(distanceToBottomOfAdContainer));

        // Controlling the scroll in the adSlot based on users scroll in the content
        let scrollTopOverridePosition = adSlotScrollableHeight * percentScrolledFromPageTopToAdUnitBottom;

        if (animationCompleted === false){
            adSlot.scrollTop = scrollTopOverridePosition;
        }
        
    } else {
        // The user's scroll has reached the adSlots place in the page, so the adSlot is returned there and remains static
        adSlot.scrollTop = adSlotScrollableHeight;
        adSlot.classList.remove('sticky-bottom')
        adSlot.style.position = 'relative'
        adSlot.style.top = `${adSlotHeight}px`; // Accounting for the animation (translateY) that brings the adSlot into view
    }
    if (distanceFromTopOfPage > distanceToBottomOfAdContainer){
        animationCompleted = true;
    }

}, false);

let lastScrollPercent;

adSlot.addEventListener('scroll', function (e) {
  
    if (adSlot.scrollTop === adSlotScrollableHeight) animationCompleted = true;
    if (animationCompleted === true) lockScroll(adSlot, adSlotScrollableHeight);
    let scrollPercent = (adSlot.scrollTop/adSlotScrollableHeight)*100;

    // Getting and setting style variable properties: https://davidwalsh.name/css-variables-javascript
    if (scrollPercent < 16.66){
        let slotOneInvertedInnerScrollPercent = 1 - (scrollPercent / 16.66);
    
        let newSlotOneXAxisPosition = slotOneXAxisStartPoint * slotOneInvertedInnerScrollPercent;
        let newSlotOneZAxisPosition = slotOneZAxisStartPoint * slotOneInvertedInnerScrollPercent;
        let newSlotOneBlur = slotOneBlurStartPoint * slotOneInvertedInnerScrollPercent;

        document.documentElement.style.setProperty('--slot-one-x-axis', `${newSlotOneXAxisPosition}px`);
        document.documentElement.style.setProperty('--slot-one-z-axis', `${newSlotOneZAxisPosition}px`);
        document.documentElement.style.setProperty('--slot-one-blur', `${newSlotOneBlur}px`);
    
    } else if (scrollPercent >= 16.66 && scrollPercent <= 50){
        // Creative 'slotOne' should be stuck in place at this point
        slotOne.classList.add('sticky-one');
        document.documentElement.style.setProperty('--slot-one-x-axis', `0px`);
        document.documentElement.style.setProperty('--slot-one-z-axis', `0px`);
        document.documentElement.style.setProperty('--slot-one-blur', `0px`);

        let slotTwoInvertedInnerScrollPercent = 1 - ((scrollPercent - 16.66)/33.33)

        let newSlotTwoXAxisPosition = slotTwoXAxisStartPoint * slotTwoInvertedInnerScrollPercent
        let newSlotTwoZAxisPosition = slotTwoZAxisStartPoint * slotTwoInvertedInnerScrollPercent;
        let newSlotTwoBlur = slotTwoBlurStartPoint * slotTwoInvertedInnerScrollPercent;

        document.documentElement.style.setProperty('--slot-two-x-axis', `${newSlotTwoXAxisPosition}px`);
        document.documentElement.style.setProperty('--slot-two-z-axis', `${newSlotTwoZAxisPosition}px`);
        document.documentElement.style.setProperty('--slot-two-blur', `${newSlotTwoBlur}px`);
        
    } else if (scrollPercent > 50 && scrollPercent <= 83.33){
        slotTwo.classList.add('sticky-two');
        document.documentElement.style.setProperty('--slot-two-x-axis', `0px`);
        document.documentElement.style.setProperty('--slot-two-z-axis', `0px`);
        document.documentElement.style.setProperty('--slot-two-blur', `0px`);

        let slotThreeInvertedInnerScrollPercent = 1 - ((scrollPercent - 50)/33.33)

        let newSlotThreeXAxisPosition = slotThreeXAxisStartPoint * slotThreeInvertedInnerScrollPercent
        let newslotThreeZAxisPosition = slotThreeXAxisStartPoint * slotThreeInvertedInnerScrollPercent
        let newslotThreeBlur = slotThreeXAxisStartPoint * slotThreeInvertedInnerScrollPercent

        document.documentElement.style.setProperty('--slot-three-x-axis', `${newSlotThreeXAxisPosition}px`);
        document.documentElement.style.setProperty('--slot-three-z-axis', `${newslotThreeZAxisPosition}px`);
        document.documentElement.style.setProperty('--slot-three-blur', `${newslotThreeBlur}px`);

    } else if (scrollPercent > 83.33){
        slotThree.classList.add('sticky-three');
        document.documentElement.style.setProperty('--slot-three-x-axis', `0px`);
        document.documentElement.style.setProperty('--slot-three-z-axis', `0px`);
        document.documentElement.style.setProperty('--slot-three-blur', `0px`);
        // animationCompleted = true;

    } else if (scrollPercent < 16.66 && scrollPercent < lastScrollPercent) {
        slotOne.classList.remove('sticky-one');
    }

    lastScrollPercent = scrollPercent;
}, false)


/** Helper Functions **/ 
// Bumping a user back to the top of the page on page refresh
function startUserAtPageTop(){
    // https://www.designcise.com/web/tutorial/how-to-force-scroll-to-the-top-of-the-page-on-page-reload-using-javascript
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    } else {
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        }
    }
}

// Checks if an elemnt is completely in the viewport
function isInViewport (element) {
    // https://gomakethings.com/how-to-test-if-an-element-is-in-the-viewport-with-vanilla-javascript/
    let bounding = element.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Returns the distance from the top of the page to the bottom of the ad-unit's container element
function getDistanceToBottomOfAdSlot(){
    // When the page loads, detect the scroll position between the top and the end of the ad unit, 
    // which is the point the ad unit should return to its normal flow in the article
    // https://stackoverflow.com/questions/11805955/how-to-get-the-distance-from-the-top-for-an-element
    let adContainer = document.getElementById('ad-container');
    let adContainerDistanceToTop = window.pageYOffset + adContainer.getBoundingClientRect().top
    let intViewportHeight = window.innerHeight;
    let adHeight = 150;
    return adContainerDistanceToTop + adHeight - intViewportHeight; 
}

// Prevents the user from scrolling within the adSlot element. Used after the animation has been completed
function lockScroll(element, height) {
    // https://davidwells.io/snippets/disable-scrolling-with-javascript
    element.scrollTo(0, height);
}