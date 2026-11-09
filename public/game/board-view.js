export const MIN_ZOOM=0.3,MAX_ZOOM=2.6;
export const clampZoom=scale=>Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,scale));
export function pinchScale(startScale,startDistance,distance) {
  return clampZoom(startScale*distance/Math.max(1,startDistance));
}
export function boardLayout(width,availableHeight,landscape,metrics={}) {
  const {labelHeight=15,scoreHeight=24,rowGap=3,columnGap=3,minCellHeight=0,minCellRatio=0}=metrics;
  const boardWidth=landscape?width:Math.max(638,width);
  const cellWidth=Math.max(1,(boardWidth-14*columnGap)/15);
  const usableRows=Math.max(7,availableHeight-labelHeight-scoreHeight-8*rowGap);
  // Keep the whole width, but never collapse cells into thin strips on short screens.
  // If the viewport cannot hold a readable sheet, the page can scroll vertically.
  const minimumHeight=Math.min(cellWidth,Math.max(minCellHeight,cellWidth*minCellRatio));
  const cellHeight=landscape?Math.max(minimumHeight,Math.min(cellWidth,usableRows/7)):cellWidth;
  return {width:boardWidth,cellWidth,cellHeight,height:7*cellHeight+labelHeight+scoreHeight+8*rowGap};
}
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
    const layout=boardLayout(this.scroll.clientWidth,available,this.landscape,{
      labelHeight:this.board.querySelector('.col-label')?.getBoundingClientRect().height??15,
      scoreHeight:this.board.querySelector('.col-score')?.getBoundingClientRect().height??24,
      rowGap:parseFloat(styles.rowGap)||0,columnGap:parseFloat(styles.columnGap)||0,
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
    this.board.style.width=`${width}px`;
    const gap=parseFloat(getComputedStyle(this.board).columnGap)||3;
    const cellWidth=(width-14*gap)/15;
    const cellHeight=this.baseRowHeight===null?cellWidth:this.baseRowHeight*this.scale;
    this.board.style.setProperty('--board-row-height',`${cellHeight}px`);
    this.board.style.setProperty('--board-column',`${cellWidth}px`);
    this.board.style.setProperty('--board-cell',`${Math.min(cellWidth,cellHeight)}px`);
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
    this.zoom(this.landscape?1:this.scroll.clientWidth/this.baseWidth);
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
