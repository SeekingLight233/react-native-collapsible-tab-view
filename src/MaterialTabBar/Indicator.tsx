import React from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated'

import { isRTL } from '../helpers'
import { IndicatorProps } from './types'

type Props = IndicatorProps & {
  /** 缩放系数(0~1)，默认 1 表示不缩放 */
  scaleFactor?: number
}
const Indicator: React.FC<Props> = ({
  indexDecimal,
  itemsLayout,
  style,
  fadeIn = false,
  // 新增的缩放系数 prop，默认值为 1
  scaleFactor = 1,
}) => {
  // 不透明度
  const opacity = useSharedValue(fadeIn ? 0 : 1)

  // 动画样式
  const stylez = useAnimatedStyle(() => {
    // 如果还没有 itemsLayout（可能拿不到宽高），先返回空
    if (itemsLayout.length === 0) {
      return {}
    }

    // 计算缩放后的宽度
    const width =
      itemsLayout.length > 1
        ? interpolate(
            indexDecimal.value,
            itemsLayout.map((_, i) => i), // 输入区间
            itemsLayout.map((v) => v.width * scaleFactor) // 输出区间
          )
        : (itemsLayout[0]?.width || 0) * scaleFactor

    // 如果要保持指示器在“item”上居中，需要给 x 加上一个偏移量：
    //   centerOffset = (v.width - v.width * scaleFactor) / 2
    // 如果有多个 item，需要对每个 item 分别计算
    const translateX =
      itemsLayout.length > 1
        ? interpolate(
            indexDecimal.value,
            itemsLayout.map((_, i) => i), // 输入区间：0,1,2...
            itemsLayout.map((v) => {
              const centerOffset = (v.width - v.width * scaleFactor) / 2
              // RTL 要取反
              return isRTL ? -1 * (v.x + centerOffset) : v.x + centerOffset
            })
          )
        : (() => {
            // 只有一个 item 的情况
            const { x, width: w } = itemsLayout[0]
            const centerOffset = (w - w * scaleFactor) / 2
            return isRTL ? -1 * (x + centerOffset) : x + centerOffset
          })()

    return {
      // 让不透明度插值平滑显示
      opacity: withTiming(opacity.value),
      transform: [{ translateX }],
      width,
    }
  }, [indexDecimal, itemsLayout, scaleFactor])

  // 当 fadeIn = true 时，让指示器从 opacity=0 -> 1
  React.useEffect(() => {
    if (fadeIn) {
      opacity.value = 1
    }
  }, [fadeIn, opacity])

  return <Animated.View style={[stylez, styles.indicator, style]} />
}

const styles = StyleSheet.create({
  indicator: {
    height: 2,
    backgroundColor: '#2196f3',
    position: 'absolute',
    bottom: 0,
  },
})

export { Indicator }
