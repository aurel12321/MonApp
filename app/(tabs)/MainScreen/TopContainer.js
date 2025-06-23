import { StyleSheet, Text, View } from 'react-native';
import SVG from './playschool.svg';

export const TopContainer = () => {
  return (
    <View>
      <SVG width="300" height="100" ></SVG>
      <Text style={styles.title}>
        On book une activité ?
      </Text>
    </View>
  )
}


const styles = StyleSheet.create({
  title:{
    color: '#4CAF50',
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight:'bold',
    fontSize:25,
    marginTop: 5,
    marginLeft: 10,
    marginBottom:5,
  }
})
