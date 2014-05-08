var page = [doc currentPage],
  artboard = [[doc currentPage] currentArtboard],
  current = artboard ? artboard : page;

var defaultConfig = {
  fontSize: 12,
  fontFill: '#FFFFFF',
  fontType: 'Helvetica',
  fill: '#FF0000'
},
  otherConfig = {
    fill: '#4A90E2'
  };

function each(layers, callback) {
  var count = [layers count];
  for (var i = 0; i < count; i++) {
    var layer = layers[i];
    callback.call(layer, layer, i);
  }
}

function addLayer(name, type, parent) {
  var parent = parent ? parent : current,
    layer = [parent addLayerOfType: type];
  if (name)[layer setName: name];
  return layer;
}

function addGroup(name, parent) {
  return addLayer(name, 'group', parent);
}

function addShape(name, parent) {
  return addLayer(name, 'rectangle', parent);
}

function addText(name, parent) {
  return addLayer(name, 'text', parent);
}

function removeLayer(layer) {
  var parent = [layer parentGroup];
  if (parent)[parent removeLayer: layer];
}

function getPosition(layer) {
  var p = {
    x: 0,
    y: 0
  },
    fn = function(layer) {
      p.x += [[layer frame] x];
      p.y += [[layer frame] y];
      if ([[layer parentGroup] class] == MSLayerGroup) {
        fn([layer parentGroup]);
      }
    };

  fn(layer);

  return p;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function setColor(layer, hex) {
  var layer = layer,
      fills = [[layer style] fills];
if ([fills count] <= 0)[fills addNewStylePart];
var fill = fills.array()[0],
  color = [fill color],
  rgb = hexToRgb(hex),
  r = rgb.r / 255,
  g = rgb.g / 255,
  b = rgb.b / 255;

[color setRed: r]
[color setGreen: g]
[color setBlue: b]
}

function getTypes(types) {
  var typeArray = types.split(','),
    types = {};

  typeArray.forEach(function(type) {
    var type = type.trim();
    types[type] = 1;
  });
  return types;
}

function toPositive(number) {
  return (number < 0) ? -(number) : number;
}

var SizeGuide = {
  Width: function(position, layer) {
    var layers = selection,
      fn = function(layer) {
        var timestamp = new Date().getTime(),
          frame = [layer frame],
          width = [frame width],
          height = [frame height],
          layerPosition = getPosition(layer),
          x = layerPosition.x,
          y = layerPosition.y;

        var group = addGroup('$GUIDE' + timestamp),
          rulerGroup = addGroup('ruler', group),
          line = addShape('line', rulerGroup),
          start = addShape('start-arrow', rulerGroup),
          end = addShape('end-arrow', rulerGroup),
          labelGroup = addGroup('label-' + width, group),
          gap = addShape('gap', labelGroup),
          label = addShape('label', labelGroup),
          text = addText('text', labelGroup);

        var gapFrame = [gap frame];
        [gapFrame setWidth: 8];
        [gapFrame setHeight: 8];
        [gap setRotation: 45];

        var lineFrame = [line frame];
        [lineFrame setWidth: width];
        [lineFrame setHeight: 1];
        [lineFrame setY: 3];

        var startFrame = [start frame];
        [startFrame setWidth: 1];
        [startFrame setHeight: 7];

        var endFrame = [end frame];
        [endFrame setWidth: 1];
        [endFrame setHeight: 7];
        [endFrame setX: width - 1];

        [text setStringValue: parseInt(width) + 'px'];
        [text setFontSize: defaultConfig.fontSize];
        [text setFontPostscriptName: defaultConfig.fontType];
        [[text frame] setX: 5];
        [[text frame] setY: 5];

        var labelFrame = [label frame],
          labelWidth = [[text frame] width] + 10,
          labelHeight = [[text frame] height] + 11;

        [labelFrame setWidth: labelWidth];
        [labelFrame setHeight: labelHeight];

        setColor(gap, defaultConfig.fill);
        setColor(line, defaultConfig.fill);
        setColor(start, defaultConfig.fill);
        setColor(end, defaultConfig.fill);
        setColor(label, defaultConfig.fill);
        setColor(text, defaultConfig.fontFill);

        [text setIsSelected: 1];
        [line setIsSelected: 1];
        [text setIsSelected: 0];
        [line setIsSelected: 0];

        var labelGroupX = parseInt([[labelGroup frame] x] + (width - labelWidth) / 2);
        labelGroupY = parseInt([[labelGroup frame] y] - (labelHeight - 7) / 2);
        [[labelGroup frame] setX: labelGroupX];
        [[labelGroup frame] setY: labelGroupY];

        var groupFrame = [group frame];
        offset = -8;

        [gapFrame addX: parseInt((labelWidth - 8) / 2)];
        [gapFrame addY: 10];

        if (width < labelWidth + 20) {
          if (position && position == 'bottom') {
            [[labelGroup frame] addY: parseInt(labelHeight / 2 + 7)];
            [gapFrame addY: parseInt(0 - 3 - 10)];
          } else {
            [[labelGroup frame] addY: parseInt(0 - 7 - labelHeight / 2)];
            [gapFrame addY: parseInt(labelHeight - 5 - 10)];
          }
        }

        if (position && position == 'middle') {
          offset = parseInt((height - 7) / 2);
        } else if (position && position == 'bottom') {
          offset = height + 1;
        }
        [groupFrame setX: x]
        [groupFrame setY: y + offset]
      }

    if (layer) {
      fn(layer);
    } else if ([layers count] > 0) {
      each(layers, fn);
    } else {
      alert("Make sure you've selected a symbol, or a layer that.");
    }
  },
  Height: function(position, layer) {
    var layers = selection,
      fn = function(layer) {
        var timestamp = new Date().getTime(),
          frame = [layer frame],
          width = [frame width],
          height = [frame height],
          layerPosition = getPosition(layer),
          x = layerPosition.x,
          y = layerPosition.y;

        var group = addGroup('$GUIDE' + timestamp),
          rulerGroup = addGroup('ruler', group),
          line = addShape('line', rulerGroup),
          start = addShape('start-arrow', rulerGroup),
          end = addShape('end-arrow', rulerGroup),
          labelGroup = addGroup('label-' + height, group),
          gap = addShape('gap', labelGroup),
          label = addShape('label', labelGroup),
          text = addText('text', labelGroup);

        var gapFrame = [gap frame];
        [gapFrame setWidth: 8];
        [gapFrame setHeight: 8];
        [gap setRotation: 45];

        var lineFrame = [line frame];
        [lineFrame setWidth: 1];
        [lineFrame setHeight: height];
        [lineFrame setX: 3];

        var startFrame = [start frame];
        [startFrame setWidth: 7];
        [startFrame setHeight: 1];

        var endFrame = [end frame];
        [endFrame setWidth: 7];
        [endFrame setHeight: 1];
        [endFrame setY: height - 1];

        [text setStringValue: parseInt(height) + 'px'];
        [text setFontSize: defaultConfig.fontSize];
        [text setFontPostscriptName: defaultConfig.fontType];
        [[text frame] setX: 5];
        [[text frame] setY: 5];

        var labelFrame = [label frame],
          labelWidth = [[text frame] width] + 10,
          labelHeight = [[text frame] height] + 11;

        [labelFrame setWidth: labelWidth];
        [labelFrame setHeight: labelHeight];

        setColor(gap, defaultConfig.fill);
        setColor(line, defaultConfig.fill);
        setColor(start, defaultConfig.fill);
        setColor(end, defaultConfig.fill);
        setColor(label, defaultConfig.fill);
        setColor(text, defaultConfig.fontFill);

        [text setIsSelected: 1];
        [line setIsSelected: 1];
        [text setIsSelected: 0];
        [line setIsSelected: 0];

        var labelGroupX = parseInt([[labelGroup frame] x] - (labelWidth - 7) / 2);
        labelGroupY = parseInt([[labelGroup frame] y] + (height - labelHeight) / 2);
        [[labelGroup frame] setX: labelGroupX];
        [[labelGroup frame] setY: labelGroupY];

        var groupFrame = [group frame];
        offset = -8;

        [gapFrame addX: 10];
        [gapFrame addY: parseInt((labelHeight - 8) / 2)];

        if (height < labelHeight + 20) {
          if (position && position == 'right') {
            [[labelGroup frame] addX: parseInt(labelWidth / 2 + 7)];
            [gapFrame addX: parseInt(0 - 3 - 10)];
          } else {
            [[labelGroup frame] addX: parseInt(0 - 7 - labelWidth / 2)];
            [gapFrame addX: parseInt(labelWidth - 5 - 10)];
          }
        }

        if (position && position == 'center') {
          offset = parseInt((width - 7) / 2);
        } 
        else if (position && position == 'right') {
          offset = width + 1;
        }
        [groupFrame setX: x + offset]
        [groupFrame setY: y]
      }

    if (layer) {
      fn(layer);
    } else if ([layers count] > 0) {
      each(layers, fn);
    } else {
      alert("Make sure you've selected a symbol, or a layer that.");
    }
  }
}

var WidthGuide = function() {
  var positions = ['null', 'top', 'middle', 'bottom'];
      index = parseInt([doc askForUserInput: '1. top; 2. middle; 3. bottom' initialValue: '1']),
      position = (index >= 1 && index < 4)? positions[index]: positions[1];
    SizeGuide.Width(position);
}

var HeightGuide = function() {
  var positions = ['null', 'left', 'center', 'right'];
      index = parseInt([doc askForUserInput: '1. left; 2. center; 3. right' initialValue: '1']),
      position = (index >= 1 && index < 4)? positions[index]: positions[1];
    SizeGuide.Height(position);
}

var SpacingGuide = function(side, isGap) {
  var layers = selection,
    layer0, layer1,
    distanceTop, distanceRight, distanceBottom, distanceLeft,
    tempX, tempY, tempW, tempH, tempLayer;

  if ([layers count] == 1 && [current class] == MSArtboardGroup) {
    layer0 = current;
    layer1 = layers[0];
  } else if ([layers count] == 2) {
    layer0 = layers[0];
    layer1 = layers[1];
  } else {
    return false;
  }

  var layer0Position = getPosition(layer0),
    layer0X = ([layers count] == 1 && [layer0 class] == MSArtboardGroup)? 0: layer0Position.x,
    layer0Y = ([layers count] == 1 && [layer0 class] == MSArtboardGroup)? 0: layer0Position.y,
    layer0W = [[layer0 frame] width],
    layer0H = [[layer0 frame] height],

    layer1Position = getPosition(layer1),
    layer1X = layer1Position.x,
    layer1Y = layer1Position.y,
    layer1W = [[layer1 frame] width],
    layer1H = [[layer1 frame] height];

  distanceTop = layer0Y - layer1Y;
  distanceRight = (layer0X + layer0W) - (layer1X + layer1W);
  distanceBottom = (layer0Y + layer0H) - (layer1Y + layer1H);
  distanceLeft = layer0X - layer1X;

  if (side && side == 'top') {
    if (distanceTop == 0) return false;
    tempLayer = addShape('temp');
    tempX = layer1X;
    tempY = layer0Y;
    tempW = layer1W;
    tempH = toPositive(distanceTop);

    if (layer0Y > layer1Y) tempY = layer1Y;

    if (isGap && layer1Y > layer0Y + layer0H) {
      tempY = layer0Y + layer0H;
      tempH = tempH - layer0H;
    } else if (isGap && layer0Y > layer1Y + layer1H) {
      tempY = layer1Y + layer1H;
      tempH = tempH - layer1H;
    } else if (isGap) {
      removeLayer(tempLayer);
      return false;
    };
  } else if (side && side == 'right') {
    if (distanceRight == 0) return false;
    tempLayer = addShape('temp');
    tempX = layer1X + layer1W;
    tempY = layer1Y;
    tempW = toPositive(distanceRight);
    tempH = layer1H;

    if (layer0X + layer0W < layer1X + layer1W) tempX = layer0X + layer0W;

    if (isGap && layer0X > layer1X + layer1W) {
      tempX = layer1X + layer1W;
      tempW = tempW - layer0W;
    } else if (isGap && layer1X > layer0X + layer0W) {
      tempW = tempW - layer1W;
    } else if (isGap) {
      removeLayer(tempLayer);
      return false;
    };
  } else if (side && side == 'bottom') {
    if (distanceBottom == 0) return false;
    tempLayer = addShape('temp');
    tempX = layer1X;
    tempY = layer1Y + layer1H;
    tempW = layer1W;
    tempH = toPositive(distanceBottom);

    if (layer0Y + layer0H < layer1Y + layer1H) tempY = layer0Y + layer0H;
  } else if (side && side == 'left') {
    if (distanceLeft == 0) return false;
    tempLayer = addShape('temp');
    tempX = layer0X;
    tempY = layer1Y;
    tempW = toPositive(distanceLeft);
    tempH = layer1H;

    if (layer0X > layer1X) tempX = layer1X;
  }

  [[tempLayer frame] setX: tempX];
  [[tempLayer frame] setY: tempY];
  [[tempLayer frame] setWidth: tempW];
  [[tempLayer frame] setHeight: tempH];
  if (side && (side == 'top' || side == 'bottom')) SizeGuide.Height('center', tempLayer);
  if (side && (side == 'right' || side == 'left')) SizeGuide.Width('middle', tempLayer);


  removeLayer(tempLayer);

}

var TipGuide = function(gapPosition, text, content) {
    if ([text class] != MSTextLayer) {
        return false;
    }
    var timestamp = new Date().getTime(),
        content = content ? '-' + content : '';

    var group = addGroup('$GUIDE' + timestamp),
        gap = addShape('gap', group),
        label = addShape('label' + content, group);

    removeLayer(text);
    [group addLayer: text]

    var gapFrame = [gap frame];
    [gapFrame setWidth: 8];
    [gapFrame setHeight: 8];
    [gap setRotation: 45];

    [text setFontSize: defaultConfig.fontSize];
    [text setFontPostscriptName: defaultConfig.fontType];
    [text setLineSpacing: parseInt(defaultConfig.fontSize * 1.2)];

    setColor(gap, defaultConfig.fill);
    setColor(label, defaultConfig.fill);
    setColor(text, defaultConfig.fontFill);

    [[label frame] setWidth: [[text frame] width] + 10]
    [[label frame] setHeight: [[text frame] height] + 11]
    [[label frame] setX: [[text frame] x] - 5];
    [[label frame] setY: [[text frame] y] - 5];

    if (gapPosition && gapPosition == 'top') {
        [[gap frame] setX: [[text frame] x] + 3];
        [[gap frame] setY: [[text frame] y] - 8];
    } else if (gapPosition && gapPosition == 'right') {
        [[gap frame] setX: [[text frame] x] + [[text frame] width]];
        [[gap frame] setY: [[text frame] y] + 3];
    } else if (gapPosition && gapPosition == 'bottom') {
        [[gap frame] setX: [[text frame] x] + 3];
        [[gap frame] setY: [[text frame] y] + [[text frame] height]];
    } else if (gapPosition && gapPosition == 'left') {
        [[gap frame] setX: [[text frame] x] - 8];
        [[gap frame] setY: [[text frame] y] + 3];
    }
    [text setIsSelected: 1];
    [text setIsSelected: 0];

    return group;
}

var TextGuide = function(position) {
  var layers = selection,
    types = 'font, size, color, line',
    getColor = function(layer) {
      var fills = [[layer style] fills].array(),
        fill = ([fills count] > 0) ? fills[0] : null,
        color = ([fills count] > 0) ? [fill color] : [layer textColor],
        hex = [color hexValue],
        rgb = hexToRgb(hex);
      return '#' + hex + ' (' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    },
    fn = function(layer) {
      if ([layer class] != MSTextLayer) return false;
      var height = [[layer frame] height],
        layerPosition = getPosition(layer),
        x = layerPosition.x,
        y = layerPosition.y,
        count = 0,
        labelText = '';

      if (types['font']) labelText += 'font: ' + [layer fontPostscriptName] + '\r\n';
      count++;
      if (types['size']) labelText += 'size: ' + parseInt([layer fontSize]) + 'px\r\n';
      count++;
      if (types['color']) labelText += 'color: ' + getColor(layer) + '\r\n';
      count++;
      if (types['line']) labelText += 'line: ' + parseInt([layer lineSpacing] / [layer fontSize] * 100) + '%\r\n';
      count++;

      labelText = [labelText trim];

      var text = addText('text');
      [text setStringValue: labelText];


      if (position && position == 'top') {
        var guide = TipGuide('bottom', text, parseInt([layer fontSize]));
        [[guide frame] setX: x + 5];
        [[guide frame] setY: y - (5 + [[text frame] height])];
      } else if (position && position == 'right') {
        var guide = TipGuide('left', text, parseInt([layer fontSize]));
        [[guide frame] setX: x + 5 + [[layer frame] width]];
        [[guide frame] setY: y];
      } else if (position && position == 'bottom') {
        var guide = TipGuide('top', text, parseInt([layer fontSize]));
        [[guide frame] setX: x + 5];
        [[guide frame] setY: y + 5 + [[layer frame] height]];
      } else if (position && position == 'left') {
        var guide = TipGuide('right', text, parseInt([layer fontSize]));

        [[guide frame] setX: x - (5 + [[text frame] width])];
        [[guide frame] setY: y];
      }
    }
  if ([layers count] > 0) {
    types = getTypes([doc askForUserInput: types initialValue: types]);
    each(layers, fn);
  } else {
    alert("Make sure you've selected a symbol, or a layer that.");
  }
}

var ShapeGuide = function(position) {
  var layers = selection,
    types = 'fill, border',
    getColor = function(colorObj) {
      var color = [colorObj color],
        hex = [color hexValue],
        rgb = hexToRgb(hex);
      return '#' + hex + ' (' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
    },
    fn = function(layer) {
      if ([layer class] != MSShapeGroup) return false;
      var layerPosition = getPosition(layer),
        height = [[layer frame] height],
        x = layerPosition.x,
        y = layerPosition.y,
        count = 0,
        labelText = '',
        fills = [[layer style] fills].array(),
        fill = ([fills count] > 0) ? fills[0] : null,
        border = [[layer style] border];

      if (types['fill'] && fill) labelText += 'fill: ' + getColor(fill) + '\r\n';
      count++;
      if (types['border'] && border) labelText += 'border: ' + getColor(border) + '\r\n';
      count++;

      labelText = [labelText trim];

      var textLayer = addText('text');
      [textLayer setStringValue: labelText];

      if (position && position == 'top') {
        var guide = TipGuide('bottom', textLayer);
        [[guide frame] setX: x + 5];
        [[guide frame] setY: y - (5 + [[textLayer frame] height])];
      } else if (position && position == 'right') {
        var guide = TipGuide('left', textLayer);
        [[guide frame] setX: x + 5 + [[layer frame] width]];
        [[guide frame] setY: y];
      } else if (position && position == 'bottom') {
        var guide = TipGuide('top', textLayer);
        [[guide frame] setX: x + 5];
        [[guide frame] setY: y + 5 + [[layer frame] height]];
      } else if (position && position == 'left') {
        var guide = TipGuide('right', textLayer);
        [[guide frame] setX: x - (5 + [[textLayer frame] width])];
        [[guide frame] setY: y];
      }
    };

  if ([layers count] > 0) {
    types = getTypes([doc askForUserInput: types initialValue: types]);
    each(layers, fn);
  } else {
    alert("Make sure you've selected a symbol, or a layer that.");
  }
}

var AllUnit = function(type){
    var scale = {
            'LDPI': .75,
            'MDPI': 1,
            'HDPI': 1.5,
           'XHDPI': 2,
          'XXHDPI': 3,
         'XXXHDPI': 4,
        'Standard': 1,
          'Retina': 2
    },
    resetUnit = function(layers){
        var layers = layers.array();

        each(layers, function(layer){
          var layerName = [layer name];
          if(
            [layer class] == MSLayerGroup &&
            layerName.match(/\$GUIDE\d+/)
          ){
            var length, textLayer;
            each([layer layers].array(), function(layer){
              var layerName = [layer name];

              if(layerName.match(/label-(\d+)/)){
                length = layerName.match(/label-(\d+)/)[1];
            if ([layer class] == MSLayerGroup) {
                  each([layer layers].array(), function(layer){
                    if([layer class] == MSTextLayer){
                      textLayer = layer;
                    }
                  });
                }
              }

              if([layer class] == MSTextLayer){
                textLayer = layer;
              }
            });


            var newLength = parseInt(length / scale[type]),
                     unit = (type.match(/DPI/))? 'dp' : 'px';
                     text = textLayer.stringValue().replace( /(\d+[dxps]{2})/g, newLength + unit),
                newTextLayer = addText('text');

            [textLayer setStringValue: text];
            [newTextLayer setStringValue: text];
            [newTextLayer setFontSize: defaultConfig.fontSize];
            [newTextLayer setFontPostscriptName: defaultConfig.fontType];
            [newTextLayer setLineSpacing: parseInt(defaultConfig.fontSize * 1.2)];

            var offset = parseInt( ( [[textLayer frame] width] - [[newTextLayer frame] width] ) / 2 );
            [[textLayer frame] addX: offset];
            removeLayer(newTextLayer);

          }
          else if( [layer class] == MSLayerGroup ){
            resetUnit([layer layers]);
          }
        });
    };

    resetUnit([current layers]);
}

var AllFill = function(type) {
  var setFill = function(layers) {
    each(layers, function(layer) {
      log([layer class]);
      if (type == 'shape' && [layer class] == MSShapeGroup) {
        setColor(layer, colorHex);
      } else if (type == 'text' && [layer class] == MSTextLayer) {
        setColor(layer, colorHex);
      } else if ([layer class] == MSLayerGroup) {
        setFill([layer layers].array());
      }
    });
  },
    resetFill = function(layers) {

      var layers = layers.array();

      each(layers, function(layer) {
        var layerName = [layer name];
        if (
          [layer class] == MSLayerGroup &&
          layerName.match(/\$GUIDE\d+/)
        ) {
          setFill([layer layers].array());

        } else if ([layer class] == MSLayerGroup) {
          resetFill([layer layers]);
        }
      });
    };

  if (type == 'text') {
    inputLabel = 'Do you want to reset all text color (HEX: FFFFFF)',
    inputValue = 'FFFFFF';
  } else if (type == 'shape') {
    inputLabel = 'Do you want to reset all background color (HEX: FF0000)',
    inputValue = '4A90E2';
  }

  var colorHex = [doc askForUserInput: inputLabel initialValue: inputValue];

  if (colorHex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)) {
    resetFill([current layers]);
  } else {
    alert('Error, Must be Color HEX!');
  }


}