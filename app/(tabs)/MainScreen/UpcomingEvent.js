import { useRouter } from 'expo-router';
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from '../../../firebaseConfig';

import {
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/baloo-2';



export const UpcomingEvent = ({userId=null, onPress}) => {

    const [fontsLoaded] = useFonts({
        Baloo2_400Regular,
        Baloo2_600SemiBold,
        Baloo2_800ExtraBold,
    });

    const router = useRouter();

    const uid = auth.currentUser.uid;

    const [loading, setLoading] = useState(true); 
    const [events, setEvents] = useState([]); 

    
    const eventsWithDateFlag = [];
    let lastDate = null;

    events.forEach(event => {
        const eventDateStr = event.dataFirebase_dateEvent.toDate().toDateString(); // string date sans heure

        if (eventDateStr !== lastDate) {
            eventsWithDateFlag.push({ ...event, showDate: true });
            lastDate = eventDateStr;
        } else {
            eventsWithDateFlag.push({ ...event, showDate: false });
        }
    });

    
    useEffect(() => {
     
        console.log(events);
     
        
        const unsubscribe = onSnapshot(collection(db, "Events"), async (querySnapshot) => {
            const fetchedEvents = await Promise.all(
                querySnapshot.docs.map(async docSnap => {
                    const eventData = docSnap.data();
                  
                    
                    if (userId && eventData.userId !== userId) return null;

                    // Récupération de l'utilisateur qui a créé l'événement
                    const userRef = doc(db, "Users", eventData.userId);
               
                    
                    const userSnap = await getDoc(userRef);
                    const userInfo = userSnap.exists() ? userSnap.data() : {};
                    

                    return {key: docSnap.id,
                        ...eventData,
                        ...userInfo
                    }
                       
                    ;
                    
                })
            );

            const validEvents = fetchedEvents.filter(event => event !== null);
            validEvents.sort((a, b) => {
                const dateA = a.dataFirebase_dateEvent.toDate();
                const dateB = b.dataFirebase_dateEvent.toDate();
                return dateA - dateB;
              });
       

            setEvents(validEvents);
            setLoading(false);
            
            
        });

        return () => unsubscribe();
    }, [userId]);

    console.log(eventsWithDateFlag)
    return (
 
        
        <FlatList
            data={eventsWithDateFlag.filter(item => item.dataFirebase_dateEvent)}
            renderItem={({ item }) => (

                <View>
                    
                    {item.showDate && (
                        <View style={styles.containerDate}>
                            <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 15 }}>
                                {item.dataFirebase_dateEvent.toDate().toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity onPress={() => router.push(`/EventDetails?id=${item.key}`)}>
                        <View style={styles.eventStyle}>
                            {/* Colonne gauche */}
                            <View style={styles.columnLeft}>
                                {item.pendingRequests?.includes(uid) && (
                                    <Text style={{ fontSize: 12, color: 'orange' }}>En attente de validation</Text>
                                )}

                                <View style={styles.iconText}>
                                    <Icon name="location-arrow" color={'blue'} size={15} />
                                    <Text style={styles.iconTextItem}>{item.dataFirebase_locationEvent}</Text>
                                </View>

                                <View style={styles.iconText}>
                                    <Icon name="clock-o" color={'blue'} size={15} />
                                    <Text style={styles.iconTextItem}>
                                        {item.dataFirebase_timeEvent.toDate().toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>

                                <View style={styles.iconText}>
                                    <Icon name="users" color={'blue'} size={15} />
                                    <Text style={styles.iconTextItem}>
                
                                        {`${item.dataFirebase_countParticipants} / ${item.dataFirebase_limitParticipants}`}


                                    </Text>
                                </View>
                            </View>

                            {/* Séparateur
                            <View style={styles.verticalSeparator} /> */}

                            {/* Colonne centre */}
                            <View style={styles.columnCenter}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={styles.nameEvent}
                                >
                                    {item.dataFirebase_nameEvent}
                                </Text>

                                <Text numberOfLines={1}
                                    ellipsizeMode="tail"
                                style={styles.userText}>
                                    {item.dataFirebase_sexeUser === 'H'
                                        ? `Papa ${item.dataFirebase_prenomUser} organise activité`
                                        : `Maman ${item.dataFirebase_prenomUser} organise activité`}
                                </Text>
                            </View>

                            {/* Colonne droite */}
                            <View style={styles.columnRight}>
                                <Text style={{ fontSize: 20 }}>
                                    {item.dataFirebase_sexeUser === 'H' ? '🙋‍♂️' : '🙋‍♀️'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>



                </View>

                
                   
               
         
          
            
                
            )}
        />
    )
}


const styles = StyleSheet.create({
    iconText: {
        padding:'3',
        flexDirection:'row',
        gap: 5,
        marginTop:3,
    },
    containerDate: {
        alignItems: 'center',     // pour centrer horizontalement
        marginVertical: 2,       // un peu d'espace au-dessus et en dessous
        backgroundColor: 'transparent',
      },
    iconTextItem: {
        fontSize: 10,
        fontFamily: 'Baloo2_600SemiBold',
       
    },
    nameEvent:{
        fontSize: 16,
        flexShrink: 1,
        // maxWidth:'50%',
        textAlign: 'center',
        fontFamily: 'Baloo2_600SemiBold',
        color: '#8B4513',
    },
    userText: {
        fontSize: 13,
        textAlign:'center',
        // maxWidth: '50%',
        fontFamily: 'Baloo2_600SemiBold',
        color: '#8B4513',
      },
    eventStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderColor: '#191970',
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 16,
        minHeight: 100,
      },

    columnLeft: {
    
        // justifyContent: 'center',
        // alignSelf: 'stretch',
        borderRightWidth: 1,
    },

    columnCenter: {
     
      
        paddingHorizontal: 6,
    
        width: '70%'
    },

    columnRight: {
     
        // alignItems: 'center',
     
   
     
    },

 
  

})
