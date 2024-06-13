import videojs from 'video.js';
import TS from './index';

import sortSprites from './utils/sortSprites';
import checkOverlap from './utils/checkOverlap';
import checkOptions from './utils/checkOptions';
import generatePreview from './utils/generatePreview';


const Plugin = videojs.getPlugin('plugin');

class ThumbnailSprite extends Plugin {
  private options: ThumbnailSprite.Options;

  constructor(player: videojs.Player, options?: ThumbnailSprite.Options) {
    super(player);
    const emptyOptions: ThumbnailSprite.Options = {
      sprites: [],
      responsiveWidthLimit: 0
    }
    this.options = (options !== undefined) ? options : emptyOptions;
    
    // When player instance is ready, initialize the plugin
    this.player.ready(() => {
      this.initializeThumbnailSprite(
        this.player,
        this.options,
      );
    });
  }

  dispose () {
    if (this.player.controlBar && 'progressControl' in this.player.controlBar) {
      const progressCtrl: TS.IIndexableComponent = (this.player.controlBar as TS.IIndexableComponent)['progressControl']
      progressCtrl.off(`mousemove`, this.onMoveOnControlBar);
      progressCtrl.off(`touchmove`, this.onMoveOnControlBar);
    }
    super.dispose()
  }

  initializeThumbnailSprite(player: videojs.Player, options: TS.Options): void {
    // If there is no option provided,
    // No need to initialize the plugin
    if (options.sprites === undefined)
      return ;
  
    // If there is no Control Bar UI or no Progress Control UI,
    // No need to initialize the plugin
    if (player.controlBar === undefined)
      return ;
    
    const controls: TS.IIndexableComponent = player.controlBar;
    if (controls['progressControl'] === undefined)
      return ;
    
    const progressCtrl: TS.IIndexableComponent = controls['progressControl'];
  
    // Sort sprite images to prevent inappropriate order
    sortSprites(options.sprites);
  
    // Check if the sprite thumbnails have overlapping section among them,
    // so that previews display their corresponding points of time correctly
    checkOverlap(options.sprites);
  
    // Check if the sprite thumbnails have all required options properly,
    // so that generating each previews executes correctly
    checkOptions(options.sprites);
  
    // Register event listener for hovering on progress control
    progressCtrl.on(`mousemove`, this.onMoveOnControlBar);
    progressCtrl.on(`touchmove`, this.onMoveOnControlBar);
    // Add class to enable styling
    player.addClass(`vjs-sprite-thumbnails`);
  }
  
  onMoveOnControlBar = () => {
    generatePreview(this.player, this.player.controlBar, this.options.sprites, this.options.responsiveWidthLimit)
  }  
}

videojs.registerPlugin('thumbnailSprite', ThumbnailSprite);

namespace ThumbnailSprite {
  // 옵션에 있어 글로벌 설정
    // 이후 스타일 추가 등으로 확장 가능성
  export interface Options {
    sprites: Array<Sprite>;
    responsiveWidthLimit: number;
  }
  export interface Sprite {
    url: string;      // thumbnail sprite's url
    start: number;    // start timestamp of this sprite in video
    duration: number; // duration of this sprite in video
    width: number;    // width of each preview image
    height: number;   // height of each preview image
    interval: number; // interval of each preview images in sprite
  };

  export interface IIndexableComponent extends videojs.Component {
    [key: string]: any;
  }
}

export default ThumbnailSprite;
