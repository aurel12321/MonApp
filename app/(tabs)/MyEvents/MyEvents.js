import { StyleSheet, Text, View } from 'react-native';
import { auth } from '../../../firebaseConfig';
import { UpcomingEvent } from '../MainScreen/UpcomingEvent';
import SVG from './playschoolMyEvents.svg';

const MyEvents = () => {

  const uid = auth.currentUser.uid;

  return (
    <View style={styles.container}>
        <View style={styles.topContainer}>
              <SVG width="60" height="100" ></SVG>
                  <Text style={styles.title}>
                    Tes activités à venir
                  </Text>
        </View>
        <UpcomingEvent userId={uid}></UpcomingEvent>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC'
    },
    topContainer: {
      flexDirection:'row',
      alignItems:'center',
  
    },
    title: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20
      }
})

export default MyEvents