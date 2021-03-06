# Torchlight II Calculator

[Live Site](http://ralrom.github.io/tl2-calculator/)

# Changelog #

## 29 January 2017

Removed Google Ads

## 10 April 2016

Moved to ReactJs

## 4 May 2015

- Rewrote the calculator
- New skill bars to make setting the level easier
- Levels can also be entered in the text input

### New file structure

- Each character now has its own folder containing:
 * Skill Icons
 * Portrait
 * Skill Descriptions
- You can now add your own characters by adding those files in a new folder.
The displayed character name in the calculator is taken from the folder name.

## 26 November 2014

- Rewrote the calculator
- New visual style

## 21 Sept 2014

### Under the Hood
- Calculator has been rewritten on the Pub/Sub design pattern
- Needs MAJOR code cleanup, but much easier to maintain now.
- XML files are no longer used. Moved to JSON strings which are smaller and easier to access;


## 18 Sept 2014

### Functional
- URL is now compressed. **Previous share links will not work**
- Skill Descriptions have been added
- Share Link section has been changed to show the full link without scrolling
- URL is now updated as skill point are spent; work is no longer lost on page refresh. (Only on supported browsers IE10+)

### Visual
- Images have been compressed (73% reduction). Certain skill icons are pixelated now but the page loads MUCH faster for new visitors..
- Skill Plus/Minus/Clear buttons have been rearranged
- Each Skill Tree now has a different color
- Skill bars now match the color of the Skill Tree
- Fixed Elemental Attunement Icon
