import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';


export const BottomNavBar = () => {
    const router=useRouter()
    return (


        <View style={styles.navBar}>
            <TouchableOpacity onPress={()=> {router.push('/AddEventScreen/AddEventScreen')}}>
                <Icon name="plus" color={'#4CAF50'} size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { router.push('/MyEvents/MyEvents') }}>
                <Icon name="calendar" color={'#4CAF50'} size={28} />
           </TouchableOpacity>
            <TouchableOpacity>
                <Icon name="wechat" color={'#4CAF50'} size={28} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { router.push('/ProfilScreen/ProfilScreen') }}>
                <Icon name="user" color={'#4CAF50'} size={28} />
            </TouchableOpacity>

            


            
        </View>




    )
}

const styles = StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        height: '8%',
        position: 'absolute',
        bottom:'0',
        left:0,
        right:0
    },
 
})
