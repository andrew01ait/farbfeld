export const MIN_ZOOM=0.3,MAX_ZOOM=2.6;
export const clampZoom=scale=>Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,scale));
export function pinchScale(startScale,startDistance,distance) {
  return clampZoom(startScale*distance/Math.max(1,startDistance));
}
const boardColumnWidth=(width,gap,gutter)=>Math.max(1,(width-gutter-(gutter?15:14)*gap)/15);
function boardLabelMetrics(columnWidth){
  const fontSize=Math.min(columnWidth*.94,7+columnWidth*.25);
  return {fontSize,labelHeight:fontSize*1.5,scoreHeight:fontSize*2+2};
}
export function boardLayout(width,availableHeight,landscape,metrics={}) {
  const {rowGap=3,columnGap=3,rowLabelWidth=0,minCellHeight=0,minCellRatio=0}=metrics;
  const boardWidth=landscape?width:Math.max(638,width);
  const cellWidth=boardColumnWidth(boardWidth,columnGap,rowLabelWidth);
  const labels=rowLabelWidth?boardLabelMetrics(cellWidth):{labelHeight:15,scoreHeight:24};
  const {labelHeight=labels.labelHeight,scoreHeight=labels.scoreHeight}=metrics;
  const usableRows=Math.max(7,availableHeight-labelHeight-scoreHeight-8*rowGap);
  // Keep the whole width, but never collapse cells into thin strips on short screens.
  // If the viewport cannot hold a readable sheet, the page can scroll vertically.
  const minimumHeight=Math.min(cellWidth,Math.max(minCellHeight,cellWidth*minCellRatio));
  const cellHeight=landscape?Math.max(minimumHeight,Math.min(cellWidth,usableRows/7)):cellWidth;
  return {width:boardWidth,cellWidth,cellHeight,height:7*cellHeight+labelHeight+scoreHeight+8*rowGap};
}
export const innerBoardWidth=(width,left=0,right=0)=>Math.max(1,Math.floor(width-left-right));
export class BoardView {
  constructor(onChange=()=>{}) {
    this.scale=1;this.baseWidth=638;this.baseRowHeight=null;this.orientation=null;this.onChange=onChange;
    this.scroll=null;this.board=null;this.gesture=null;this.ignoreClickUntil=0;
    this.resizeFrame=0;
    const schedule=resize=>{
      if(!resize&&(!this.landscape||Math.abs(this.scale-1)>.001||this.gesture))return;
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame=requestAnimationFrame(()=>this.measure(resize));
    };
    window.addEventListener('resize',()=>schedule(true));
    window.addEventListener('scroll',()=>schedule(false),{passive:true});
    window.visualViewport?.addEventListener('resize',()=>schedule(true));
    window.visualViewport?.addEventListener('scroll',()=>schedule(false),{passive:true});
  }
  get landscape(){return window.matchMedia('(orientation: landscape)').matches&&window.innerWidth>=560;}
  get percent(){return Math.round(this.scale*100);}
  snapshot(){return this.scroll?{left:this.scroll.scrollLeft,top:window.scrollY}:null;}
  attach(scroll,board,{center=false,previous=null}={}) {
    this.abort?.abort();this.abort=new AbortController();this.scroll=scroll;this.board=board;
    if(!scroll||!board)return;
    const signal=this.abort.signal;
    scroll.addEventListener('touchstart',e=>this.touchStart(e),{passive:false,signal});
    scroll.addEventListener('touchmove',e=>this.touchMove(e),{passive:false,signal});
    for(const event of ['touchend','touchcancel'])scroll.addEventListener(event,e=>this.touchEnd(e),{passive:false,signal});
    scroll.addEventListener('click',e=>{if(performance.now()<this.ignoreClickUntil){e.preventDefault();e.stopImmediatePropagation();}},{capture:true,signal});
    scroll.addEventListener('wheel',e=>{
      if(!e.ctrlKey)return;e.preventDefault();
      this.zoom(this.scale*Math.exp(-e.deltaY*.009),e.clientX);
    },{passive:false,signal});
    this.measure(false);
    if(center||!previous)scroll.scrollLeft=Math.max(0,(board.offsetWidth-scroll.clientWidth)/2);
    else scroll.scrollLeft=previous.left;
    this.paintLabel();
  }
  measure(resize=false) {
    if(!this.scroll?.isConnected||!this.board)return;
    const orientation=this.landscape?'landscape':'portrait';
    const changed=this.orientation!==null&&this.orientation!==orientation;
    if(changed)this.scale=1;
    this.orientation=orientation;
    const midpoint=this.scroll.scrollLeft+this.scroll.clientWidth/2;
    const ratio=midpoint/Math.max(1,this.board.offsetWidth);
    this.board.classList.toggle('landscape-board',this.landscape);
    const styles=getComputedStyle(this.board),card=this.scroll.closest('.board-card'),shell=this.scroll.closest('.app-shell');
    const viewport=window.visualViewport;
    const visibleTop=viewport?.offsetTop??0;
    const visibleBottom=visibleTop+(viewport?.height??window.innerHeight);
    // getBoundingClientRect is relative to the visible viewport: never add document scroll here.
    const top=Math.max(visibleTop,this.scroll.getBoundingClientRect().top);
    const padding=(el,key)=>el?parseFloat(getComputedStyle(el)[key])||0:0;
    const safeBottom=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-safe-bottom'))||0;
    const colorBar=card?.nextElementSibling;
    const colorsVisible=colorBar?.matches('.color-progress')&&getComputedStyle(colorBar).display!=='none';
    const colorSpace=colorsVisible?colorBar.getBoundingClientRect().height+padding(colorBar,'marginTop')+padding(colorBar,'marginBottom'):0;
    const bottomSpace=padding(this.scroll,'paddingBottom')+padding(card,'paddingBottom')+padding(card,'borderBottomWidth')+padding(shell,'paddingBottom')+safeBottom+colorSpace+2;
    const available=Math.max(1,visibleBottom-top-bottomSpace);
    const scrollStyle=getComputedStyle(this.scroll),innerWidth=innerBoardWidth(this.scroll.clientWidth,parseFloat(scrollStyle.paddingLeft)||0,parseFloat(scrollStyle.paddingRight)||0);
    const layout=boardLayout(innerWidth,available,this.landscape,{
      rowGap:parseFloat(styles.rowGap)||0,columnGap:parseFloat(styles.columnGap)||0,
      rowLabelWidth:this.board.classList.contains('numbered-board')?parseFloat(styles.getPropertyValue('--board-row-label-width'))||20:0,
      minCellHeight:20,
      minCellRatio:2/3
    });
    this.baseWidth=layout.width;this.baseRowHeight=this.landscape?layout.cellHeight:null;
    this.applyWidth();
    if(changed)this.scroll.scrollLeft=Math.max(0,(this.board.offsetWidth-this.scroll.clientWidth)/2);
    else if(resize)this.scroll.scrollLeft=ratio*this.board.offsetWidth-this.scroll.clientWidth/2;
    this.paintLabel();
  }
  applyWidth(){
    if(!this.board)return;
    const width=Math.floor(this.baseWidth*this.scale);
    const styles=getComputedStyle(this.board),gap=parseFloat(styles.columnGap)||3;
    const gutter=this.board.classList.contains('numbered-board')?parseFloat(styles.getPropertyValue('--board-row-label-width'))||20:0;
    const cellWidth=boardColumnWidth(width,gap,gutter);
    const cellHeight=this.baseRowHeight===null?cellWidth:this.baseRowHeight*this.scale;
    this.board.style.width=`${width}px`;
    this.board.style.setProperty('--board-row-height',`${cellHeight}px`);
    this.board.style.setProperty('--board-column',`${cellWidth}px`);
    this.board.style.setProperty('--board-cell',`${Math.min(cellWidth,cellHeight)}px`);
    if(gutter){
      const {fontSize,labelHeight,scoreHeight}=boardLabelMetrics(cellWidth);
      this.board.style.setProperty('--board-coordinate-size',`${fontSize}px`);
      this.board.style.setProperty('--board-label-height',`${labelHeight}px`);
      this.board.style.setProperty('--board-score-height',`${scoreHeight}px`);
    }
  }
  paintLabel(){
    const label=document.getElementById('board-zoom-value');if(label)label.textContent=`${this.percent}%`;
    const out=document.querySelector('[data-action="zoom-out"]'),inside=document.querySelector('[data-action="zoom-in"]');
    if(out)out.disabled=this.scale<=MIN_ZOOM+.001;if(inside)inside.disabled=this.scale>=MAX_ZOOM-.001;
    this.onChange(this.percent);
  }
  zoom(scale,clientX=null,anchor=null) {
    if(!this.scroll||!this.board)return;
    const rect=this.scroll.getBoundingClientRect();
    const point=clientX??rect.left+this.scroll.clientWidth/2;
    const old=this.board.getBoundingClientRect();
    const contentRatio=anchor??(point-old.left)/Math.max(1,old.width);
    this.scale=clampZoom(scale);this.applyWidth();
    const next=this.board.getBoundingClientRect();
    this.scroll.scrollLeft+=next.left+contentRatio*next.width-point;
    this.paintLabel();
  }
  fit(){
    if(!this.scroll)return;
    this.scale=1;
    this.measure(false);
    const styles=getComputedStyle(this.scroll),width=innerBoardWidth(this.scroll.clientWidth,parseFloat(styles.paddingLeft)||0,parseFloat(styles.paddingRight)||0);
    if(this.landscape){
      // Fitting can remove the page scrollbar and free more room for the board.
      if(width!==this.baseWidth)this.measure(false);
    }else this.zoom(width/this.baseWidth);
    this.scroll.scrollLeft=0;
  }
  focus(){this.zoom(1);}
  touchStart(e){
    if(e.touches.length!==2)return;
    e.preventDefault();
    const [a,b]=e.touches,rect=this.board.getBoundingClientRect();
    const center={x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2};
    this.gesture={distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),scale:this.scale,
      anchorX:(center.x-rect.left)/rect.width,anchorY:(center.y-rect.top)/rect.height};
    this.ignoreClickUntil=performance.now()+600;
    this.scroll.classList.add('is-pinching');
  }
  touchMove(e){
    if(!this.gesture||e.touches.length!==2)return;
    e.preventDefault();const [a,b]=e.touches;
    const x=(a.clientX+b.clientX)/2,y=(a.clientY+b.clientY)/2;
    const distance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    this.zoom(pinchScale(this.gesture.scale,this.gesture.distance,distance),x,this.gesture.anchorX);
    const next=this.board.getBoundingClientRect();
    window.scrollBy(0,next.top+this.gesture.anchorY*next.height-y);
    this.ignoreClickUntil=performance.now()+600;
  }
  touchEnd(e){
    if(!this.gesture)return;
    if(e.cancelable)e.preventDefault();
    this.ignoreClickUntil=performance.now()+500;
    if(e.touches.length<2){this.gesture=null;this.scroll?.classList.remove('is-pinching');}
  }
}

// The non-interactive shot map uses the same scoped touch/wheel gesture handling,
// but its natural width is always the viewport rather than the main playing sheet.
export class ShotMapView extends BoardView {
  get landscape(){return true;}
  attach(scroll,board,{key=''}={}){
    const same=this.key===key,previous=same?this.snapshot():null;
    if(!same){this.key=key;this.scale=1;}
    super.attach(scroll,board,{previous,center:!same});
  }
  measure(resize=false){
    if(!this.scroll?.isConnected||!this.board||!this.scroll.closest('details')?.open)return;
    const styles=getComputedStyle(this.scroll),width=innerBoardWidth(this.scroll.clientWidth,parseFloat(styles.paddingLeft)||0,parseFloat(styles.paddingRight)||0);
    if(width<=1)return;
    const ratio=(this.scroll.scrollLeft+width/2)/Math.max(1,this.board.offsetWidth);
    this.baseWidth=width;this.applyWidth();
    if(resize)this.scroll.scrollLeft=ratio*this.board.offsetWidth-width/2;
    this.paintLabel();
  }
  applyWidth(){
    if(!this.board)return;
    const styles=getComputedStyle(this.board),width=Math.floor(this.baseWidth*this.scale),gap=parseFloat(styles.columnGap)||3;
    const label=parseFloat(styles.getPropertyValue('--shot-row-label-width'))||20;
    this.board.style.width=width+'px';
    this.board.style.setProperty('--shot-cell',Math.max(1,(width-label-15*gap)/15)+'px');
  }
  zoom(scale,clientX=null,anchor=null){super.zoom(Math.max(1,scale),clientX,anchor);}
  fit(){this.scale=1;this.measure(false);if(this.scroll)this.scroll.scrollLeft=0;this.paintLabel();}
  paintLabel(){
    const view=this.scroll?.closest('.battle-map-view');if(!view)return;
    const label=view.querySelector('[data-shot-zoom]');if(label)label.textContent=this.percent+'%';
    const out=view.querySelector('[data-action="battle-zoom-out"]'),inside=view.querySelector('[data-action="battle-zoom-in"]');
    if(out)out.disabled=this.scale<=1.001;if(inside)inside.disabled=this.scale>=MAX_ZOOM-.001;
  }
}

// Both placement editors have their own labelled grid and fit/zoom state. Reuse
// the scoped touch handlers so a pinch cannot accidentally place a ship or mine.
export class PlacementView extends ShotMapView {
  get landscape(){return false;}
  snapshot(){const previous=super.snapshot();return previous?{...previous,scrollTop:this.scroll.scrollTop}:null;}
  attach(scroll,board,options={}){
    const previous=this.key===options.key?this.snapshot():null;
    super.attach(scroll,board,options);
    if(scroll)scroll.scrollTop=previous?.scrollTop??0;
  }
  measure(resize=false){
    if(!this.scroll?.isConnected||!this.board)return;
    const styles=getComputedStyle(this.scroll),grid=getComputedStyle(this.board);
    const width=innerBoardWidth(this.scroll.clientWidth,parseFloat(styles.paddingLeft)||0,parseFloat(styles.paddingRight)||0);
    if(width<=1)return;
    const height=(parseFloat(styles.maxHeight)||Infinity)-(parseFloat(styles.paddingTop)||0)-(parseFloat(styles.paddingBottom)||0);
    const columnGap=parseFloat(grid.columnGap)||3,rowGap=parseFloat(grid.rowGap)||3;
    const heightWidth=Math.max(1,(height-14-7*rowGap)/7)*15+14+15*columnGap;
    const ratio=(this.scroll.scrollLeft+width/2)/Math.max(1,this.board.offsetWidth);
    this.baseWidth=Math.min(width,heightWidth);this.applyWidth();
    if(resize)this.scroll.scrollLeft=ratio*this.board.offsetWidth-width/2;
    this.paintLabel();
  }
  applyWidth(){
    if(!this.board)return;
    const width=Math.floor(this.baseWidth*this.scale),gap=parseFloat(getComputedStyle(this.board).columnGap)||3,label=14*this.scale;
    this.board.style.width=width+'px';
    this.board.style.setProperty('--placement-label',label+'px');
    this.board.style.setProperty('--placement-cell',Math.max(1,(width-label-15*gap)/15)+'px');
  }
  zoom(scale,clientX=null,anchor=null){
    if(!this.scroll||!this.board)return;
    const point=this.scroll.getBoundingClientRect().top+this.scroll.clientHeight/2,before=this.board.getBoundingClientRect();
    const ratio=(point-before.top)/Math.max(1,before.height);
    super.zoom(scale,clientX,anchor);
    const next=this.board.getBoundingClientRect();this.scroll.scrollTop+=next.top+ratio*next.height-point;
  }
  touchMove(e){
    if(!this.gesture||e.touches.length!==2)return;e.preventDefault();
    const [a,b]=e.touches,x=(a.clientX+b.clientX)/2,y=(a.clientY+b.clientY)/2;
    this.zoom(pinchScale(this.gesture.scale,this.gesture.distance,Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)),x,this.gesture.anchorX);
    const next=this.board.getBoundingClientRect();this.scroll.scrollTop+=next.top+this.gesture.anchorY*next.height-y;
    this.ignoreClickUntil=performance.now()+600;
  }
  fit(){super.fit();if(this.scroll)this.scroll.scrollTop=0;}
  paintLabel(){
    const view=this.scroll?.closest('.placement-map');if(!view)return;
    const label=view.querySelector('[data-placement-zoom]');if(label)label.textContent=this.percent+'%';
    const out=view.querySelector('[data-action="placement-zoom-out"]'),inside=view.querySelector('[data-action="placement-zoom-in"]');
    if(out)out.disabled=this.scale<=1.001;if(inside)inside.disabled=this.scale>=MAX_ZOOM-.001;
  }
}
