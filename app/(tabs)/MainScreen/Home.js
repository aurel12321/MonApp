


import { StyleSheet, View } from 'react-native';
import { BottomNavBar } from './BottomNavBar';
import { TopContainer } from './TopContainer';
import { UpcomingEvent } from './UpcomingEvent';

const Home = () => {


    return (


        <View style={styles.container}>
            <TopContainer style={styles.topContainer}></TopContainer>
            <UpcomingEvent></UpcomingEvent>
            <BottomNavBar></BottomNavBar>
        </View>




    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC'
    },
    topContainer: {
        height: '20%'
    }
})


export default Home