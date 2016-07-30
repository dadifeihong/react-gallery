require('normalize.css/normalize.css');
require('styles/App.css');
//把图片等数据加载进来
let imgData = require('../data/imgData.json');
//从加载进来的图片数组中获取图片路径
let imgDataUrl = (function(imgDatasArr){
  
    var singleImageData = '';
    for(var i=0,j=imgDatasArr.length;i<j;i++){
         singleImageData = imgDatasArr[i];
         singleImageData.imgUrl = require( '../images/'+singleImageData.fileName);
         imgDatasArr[i] = singleImageData;
    }
    return imgDatasArr;

})(imgData);

import React from 'react';



class AppComponent extends React.Component {
  render() {
    return (
      <div className="index">
       
           <section className="stage">
                <section className="img-sec"></section>
                <nav className="controller-nav"></nav>
           </section>
        
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
