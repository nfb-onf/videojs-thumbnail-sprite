import videojs from 'video.js';
import TS from '../index';

import applyStyle from './applyStyle';

function generatePreview(
  player: videojs.Player,
  controls: TS.IIndexableComponent,
  sprites: Array<TS.Sprite>,
  responsiveWidthGuideline: number
): void {
  const dom = videojs.dom;
  let sprite: TS.Sprite;
  // 3-dimension approach
  let hoverPoint: number = -1;  // which point of time currently hovering
  let optionIndex: number = -1; // which sprite image to use
  let spriteIndex: number = -1; // which one inside a sprite image to use

  // The case that Progress Control UI does not exist have already been filtered before this function is called
  const progressCtrl: TS.IIndexableComponent = controls['progressControl'];

  // If there is no Seek Bar UI or Mouse Time Display UI,
  // No Need to initialize the plugin
  if (progressCtrl['seekBar'] === null)
    return ;
  
  const seekBar: TS.IIndexableComponent = progressCtrl['seekBar'];
  if (seekBar['mouseTimeDisplay'] === null)
    return ;

  const mouseTimeDisplay: TS.IIndexableComponent = seekBar['mouseTimeDisplay'];
  if (mouseTimeDisplay['timeTooltip'] === null)
    return ;

  const timeTooltip: TS.IIndexableComponent = mouseTimeDisplay['timeTooltip'];
  
  // The components used to calculate the current point of time
  const mouseTimeDisplayEl: HTMLElement = mouseTimeDisplay.el() as HTMLElement;
  // The component to apply preview image on
  const timeTooltipEl: HTMLElement = timeTooltip.el() as HTMLElement;

  // from mouse pointer's location, get the point of time
  hoverPoint = parseFloat(mouseTimeDisplayEl.style.left);
  hoverPoint = player.duration() * (hoverPoint / seekBar.currentWidth());

  // from point of time currently hovering, get the corresponding preview image
  if (!isNaN(hoverPoint)) {
    // determine where the `hoverPoint` belongs
    for (let i = 0 ; i < sprites.length ; i++) {
      const sprite: TS.Sprite = sprites[i];
      if (hoverPoint < sprite.start + sprite.duration) {
        optionIndex = i;
        break;
      }
    }
  } else {
    // if `hoverPoint` has a strange value, assign default value as 0
    hoverPoint = 0;
  }

  // if `optionIndex` is -1, it means corresponding thumbnail sprite does not exist
  // so just use the first sprite

  // calculate which image inside the sprite to use
  spriteIndex = optionIndex !== -1 ? (hoverPoint - sprites[optionIndex].start) / sprites[optionIndex].interval : hoverPoint;
  sprite = optionIndex !== -1 ? sprites[optionIndex] : sprites[0]; // create temporary `img` element to get the size of sprite thumbnail


  //calculate scaling factor according to responsiveWidthGuideline option
  var playerWidth = player.currentWidth();
  var scale = responsiveWidthGuideline && playerWidth < responsiveWidthGuideline ? playerWidth / responsiveWidthGuideline : 1; 

  var image = dom.createEl('img', {
    src: sprite.url
  });
  var imageWidth = image.naturalWidth;
  var imageHeight = image.naturalHeight; // get the coordinate to extract preview image from sprite thumbnail

  var spriteWidth = sprite.width * scale;
  var spriteHeight = sprite.height * scale;

  var columns = imageWidth / sprite.width;
  var columnTop = Math.floor(spriteIndex / columns) * -spriteHeight;
  var columnLeft = Math.floor(spriteIndex % columns) * -spriteWidth; // get the position to display preview image

  var controlsTop = dom.getBoundingClientRect(controls.el()).top;
  var seekBarTop = dom.getBoundingClientRect(controls.el()).top;
  var topOffset = -spriteHeight - Math.max(0, seekBarTop - controlsTop); // apply image preview

  var backgroundSize = (imageWidth * scale) + "px " + (imageHeight * scale) + "px";

  var style = {
    width: spriteWidth + "px",
    height: spriteHeight + "px",
    'background-image': "url(" + sprite.url + ")",
    'background-repeat': "no-repeat",
    'background-position': columnLeft + "px " + columnTop + "px",
    'background-size': backgroundSize,
    top: topOffset + "px",
    color: "#ffffff",
    'text-shadow': "1px 1px #000000",
    border: "1px solid #000000",
    margin: "0 1px"
  };

  applyStyle(timeTooltipEl, style); 
  
  // TODO
  // apply global style from `options` parameter
}

export default generatePreview;
