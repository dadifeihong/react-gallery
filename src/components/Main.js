require('normalize.css/normalize.css');
require('styles/App.scss');
//把图片等数据加载进来
let imgDatas = require('../data/imgData.json');
//从加载进来的图片数组中获取图片路径
imgDatas = (function (imgDatasArr) {

  var singleImageData = '';
  for (var i = 0, j = imgDatasArr.length; i < j; i++) {
    singleImageData = imgDatasArr[i];
    singleImageData.imgUrl = require('../images/' + singleImageData.fileName);
    imgDatasArr[i] = singleImageData;
  }
  return imgDatasArr;

})(imgDatas);

import React from 'react';
import ReactDOM from 'react-dom';
/**
 * 获取两个数之间的随机整数
 */
function getRandomInt(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}
/**
 * 获取0-30度之间的任意正负值
 */
function get30DegRandom() {
  return  (Math.random()>0.5 ? '' : '-')+Math.ceil(Math.random()*30);
}

var ImgFigure = React.createClass({
  handleClick:function(e){
      if(this.props.arrange.isCenter){
          this.props.inverse();  //调用函数
      }else{
          this.props.center();
      }
      
      e.stopPropagation();
      e.preventDefault();
  },
  render: function () {
    var styleObjec = {};
    //如果存在指定的位置信息 就直接使用
    if(this.props.arrange.pos){
       styleObjec = this.props.arrange.pos;
    }
    //如果rotate不为0，就添加rotate值
    if(this.props.arrange.rotate){
      //添加厂商前缀
      (['WebkitTransform','msTransform','MozTransform','transform']).forEach(function(value){
          styleObjec[value] = 'rotate('+this.props.arrange.rotate+'deg)';
      }.bind(this))
    }
    //设置中心图片的层级
    if(this.props.arrange.isCenter){
      styleObjec.zIndex = 11;
    }
    //设置是否翻转
    var imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse?' is-inverse':'';
    return (
      <figure className={imgFigureClassName} style={styleObjec} onClick={this.handleClick}>
        <img src={this.props.data.imgUrl} alt={this.props.data.fileName} />

        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className='img-back' onClick={this.handleClick}>
              <p>
                {this.props.data.desc}
              </p>
          </div>
        </figcaption>
      </figure>
    );
  }
});
//控制组件
var ControllerUnit = React.createClass({
  handleClick:function(e){
    console.log(1);
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    e.preventDefault();
    e.stopPropagation();
  },
  render:function(){
      var ControllerUnitClassName = "controller-unit";
      //如果显示的是图片的居中状态，对应显示相应的控制状态
      if(this.props.arrange.isCenter){
         ControllerUnitClassName += ' is-center';
         //如果同时显示的是图片的翻转状态 那么对应显示控制按钮的翻转状态
         if(this.props.arrange.isInverse){
           ControllerUnitClassName += ' is-inverse';
         }
      }
      return <span onClick={this.handleClick} className={ControllerUnitClassName}></span>
  }
})

class AppComponent extends React.Component {

  Constant={
    //中心点位置
    centerPos:{
      left:0,
      top:0
    },
    //水平方向的取值范围
    hPosRange:{
      leftSecX:[0,0],//左边区域x的取值范围
      rightSecX:[0,0], //右边区域x的取值范围
      y:[0,0]  //y轴的取值范围 左右是一致的
    },
    vPosRang:{//垂直方向的取值范围
      x:[0,0],
      topY:[0,0]
    }

  }
  /**
   * 翻转图片
   * @param index 输入当前被执行翻转的图片的索引值 用来指定翻转某张图片
   * @return ｛Function｝ 这是一个闭包函数，其内返回一个真正待执行的函数
   */
  inverse (index){    //为什么要用闭包？
      return function(){
          //  console.log(index);
           //获取到当前的状态里的数组
           var imgsArrangeArr = this.state.imgsArrangeArr;
           //将原来的状态取反
           imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse
           //更新状态
           this.setState({
             imgsArrangeArr:imgsArrangeArr
           })
      }.bind(this);
  }
  /**
   * 利用rearrange 函数，居中对应的index图片
   * @param index 需要被居中的图片在数组中的index值
   * @return ｛Function｝
   */
   center (index){
       return function(){
          // console.log(index);
          this.rearrange(index);
       }.bind(this)
   }

  /**
   * 重新布局所有图片
   * @param centerIndex 指定让哪个图片居中
   */
  rearrange (centerIndex){
      var imgsArrangeArr = this.state.imgsArrangeArr, //获取到状态值里面的数组
          Constant = this.Constant,    //获取到各个分区的范围，此时已经更新
          centerPos = Constant.centerPos, //中心点的位置
          hPosRange = Constant.hPosRange, //水平方向的取值范围
          vPosRang = Constant.vPosRang, //垂直方向的取值范围
          hPosRangeLeftSecX = hPosRange.leftSecX, //左边区域x的取值范围
          hPosRangeRightSecX = hPosRange.rightSecX, //右边区域x的取值范围
          hPosRangeY = hPosRange.y, //y轴的取值范围 左右一致
          vPosRangX = vPosRang.x,  //垂直方向上的x取值范围
          vPosRangTopY = vPosRang.topY, //垂直方向上y的取值范围
          imgsArrangeTopArr = [], //用来存储上边区域图片的状态信息，从整个图片数据中取0个或者1个放到上侧区域
          topImgNum = Math.floor(Math.random()*2), //上侧区域随机图片的个数
          topImgSpliceIndex = 0, //标记上侧区域的这张图片是从数组的哪个位置拿出来的
          imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1); //存放中心图片的状态信息

          //首先居中 centerIndex 的图片
          // imgsArrangeCenterArr[0].pos = centerPos;

          //居中的图片不需要旋转
          // imgsArrangeCenterArr[0].rotate = 0;

          imgsArrangeCenterArr[0]={
              pos:centerPos,
              rotate:0,
              isCenter:true

          }

          //取出要布局上侧的图片等状态信息
          topImgSpliceIndex = Math.ceil(Math.random()*(imgsArrangeArr.length -topImgNum));//更新取的位置
          imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);
          
          //布局位于上侧的图片
          imgsArrangeTopArr.forEach(function(value,index) {
              imgsArrangeTopArr[index] = {
                 pos:{
                      top:getRandomInt(vPosRangTopY[0],vPosRangTopY[1]),
                      left:getRandomInt(vPosRangX[0],vPosRangX[1])
                 },
                 rotate:get30DegRandom(),
                 isCenter:false
                
              }
          });
          //布局两侧的状态信息
          for(var i=0,len=imgsArrangeArr.length,k=len/2;i<len;i++){
              var hPosRangeLeftORRight = null;
              //前半部分 布局到左边 后半部分布局到右边
              if(i < k){
                 hPosRangeLeftORRight = hPosRangeLeftSecX;
              }else{
                 hPosRangeLeftORRight = hPosRangeRightSecX;
              }
              //给数组里每个元素加pos属性 也就是位置信息
              imgsArrangeArr[i] = {
                 pos:{
                    left:getRandomInt(hPosRangeLeftORRight[0],hPosRangeLeftORRight[1]),
                    top:getRandomInt(hPosRangeY[0],hPosRangeY[1])
                 },
                 rotate:get30DegRandom(),
                 isCenter:false
              }
          }
           //把上侧的那个图片添加到数组中
          if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
              imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
          }
          //把中心区域到图片添加到数组中
          imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);
          //更新状态值 重新渲染页面
          this.setState({
              imgsArrangeArr:imgsArrangeArr
          })

}
  //设置初始化状态
  constructor (props){
      super(props);
      this.state = {
        //这个数组存放图片的状态
         imgsArrangeArr:[]
      }
  }
  //组件加载以后，为每张图片计算其位置的范围
  componentDidMount (){
      //获取到舞台对象
      var stageDOM = ReactDOM.findDOMNode(this.refs.stage);
      //拿到舞台的宽
      var stageW = stageDOM.scrollWidth;
      //拿到舞台的高
      var stageH = stageDOM.scrollHeight;
      //舞台一半的宽
      var halfStageW = Math.ceil( stageW / 2 );
      //舞台一半的高
      var halfStageH = Math.ceil(stageH / 2);

      //拿到一个imgFigure对象
      var imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0);
      //拿到一个imgFigure对象的宽
      var imgW = imgFigureDOM.scrollWidth;
      //拿到一个imgFigure对象的高
      var imgH = imgFigureDOM.scrollHeight;
      //取imgW的一半
      var halfImgW = Math.ceil( imgW / 2 );
      //取imgH的一半
      var halfImgH = Math.ceil(imgH / 2);


      //计算中心图片等位置
      this.Constant.centerPos = {
        left:halfStageW - halfImgW,
        top: halfStageH - halfImgH
      };

      //计算图片左边区域的x轴的范围
      this.Constant.hPosRange.leftSecX[0] = - halfImgW;
      this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;

      // 计算图片右边区域x轴的距离
      this.Constant.hPosRange.rightSecX[0] =  halfStageW + halfImgW;
      this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;

      //计算图片的高度的范围 左右都一样
      this.Constant.hPosRange.y[0] = -halfImgH;
      this.Constant.hPosRange.y[1] =  stageH - halfImgH;

      //计算垂直方向上x轴的取值范围
      this.Constant.vPosRang.x[0] = halfStageW - halfImgW ;
      this.Constant.vPosRang.x[1] = halfStageW;
      
      //计算垂直方向上y轴的取值范围
      this.Constant.vPosRang.topY[0] = -halfImgH;
      this.Constant.vPosRang.topY[1] = halfStageH - halfImgH * 3;

      this.rearrange(0);
  }
  render () {
    var controllerUnits = [],
      imgFigures = [];
    imgDatas.forEach(function (element,index) {
       
      if(!this.state.imgsArrangeArr[index]){
         this.state.imgsArrangeArr[index] = {
             //初始的时候 每张图片的位置都是0  也就是叠在一起靠左靠上排列
             pos:{
                left : 0,
                top : 0
             },
             rotate:0,
             isInverse:false,   //表示是否翻转 默认false 为正面  true 为翻转  表示反面
             isCenter:false
         }
      }
      imgFigures.push(<ImgFigure center={this.center(index)} inverse={this.inverse(index)} arrange={this.state.imgsArrangeArr[index]} data={element} ref={'imgFigure'+index} key={element._id + Date.now}/>);
      controllerUnits.push(<ControllerUnit arrange={this.state.imgsArrangeArr[index]} center={this.center(index)} inverse={this.inverse(index)} key={element._id + Date.now} />);
  
    }.bind(this));
      
    return (
      <div className="index">
        <section className="stage" ref="stage">
          <section className="img-sec">
            {imgFigures}
          </section>
          <nav className="controller-nav">
            {controllerUnits}
          </nav>
        </section>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
