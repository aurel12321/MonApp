import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from '../../firebaseConfig';


const { width, height } = Dimensions.get('window')
export default function EventDetails() {


    const handleJoinEvent = async (eventId, autoValidate) => {
        const eventRef = doc(db, "Events", eventId);

        try {
            if (autoValidate) {
                // Rejoindre directement
                await updateDoc(eventRef, {
                    dataFirebase_usersParticipants: arrayUnion(currentUserId)
                });
                alert("Tu as rejoint l'activité !");
            } else {
                if (!hasRequested) {
                    await updateDoc(eventRef, {
                        pendingRequests: arrayUnion(currentUserId)
                    });
                    alert("Demande envoyée à l'organisateur !");
                    setHasRequested(true);
                } else {
                    await updateDoc(eventRef, {
                        pendingRequests: arrayRemove(currentUserId)
                    });
                    alert("Demande annulée.");
                    setHasRequested(false);
                }
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'événement :", error);
            alert("Une erreur est survenue. Réessaye plus tard.");
        }
    };


    const router = useRouter()
    const [hasRequested, setHasRequested] = useState(false);
    const currentUserId = auth.currentUser.uid;
    console.log(currentUserId)
    const { id } = useLocalSearchParams(); // récupère l’ID de l’événement
    const [event, setEvent] = useState(null);
    const [userFirebase, setUserFirebase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const docRef = doc(db, 'Events', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent(docSnap.data());

                    const eventData = docSnap.data();
                    setEvent(eventData);

                    if (eventData.pendingRequests?.includes(currentUserId)) {
                        setHasRequested(true);
                    }

                    if (eventData.userId) {
                        const userRef = doc(db, 'Users', eventData.userId);
                        console.log(userRef)
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {

                            setUserFirebase(userSnap.data());
                        }
                    }

                } else {
                    console.log('Aucun événement trouvé avec cet ID');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l’événement :', error);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchEvent();
        }
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Chargement...</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Événement non trouvé</Text>
            </View>
        );
    }
    console.log(userFirebase)
    return (
        <View style={styles.container}>
           
                <View>
                    <Text style={styles.title}>{`Détails de l'évenement`}</Text>
                </View>
                <View style={styles.containerOrga}>
                    <View>    <Text style={{ fontSize: 60 }}>
                        {userFirebase.dataFirebase_sexeUser === 'H' ? '🙋‍♂️' : '🙋‍♀️'}
                    </Text>
                    </View>

                    <View style={styles.containerOrgaText}>
                        <View><Text style={{ color: "#8B4513", fontFamily: 'Baloo2_600SemiBold', fontSize: 14 }}>
                            {userFirebase.dataFirebase_sexeUser === 'H' ?
                                `Papa ${userFirebase.dataFirebase_prenomUser} organise l'activité :`
                                : `Maman ${userFirebase.dataFirebase_prenomUser} organise l'activité :`}</Text>
                        </View>

                        <View>
                            <Text style={{ color: "#8B4513", fontFamily: 'Baloo2_600SemiBold', textAlign: 'center', fontSize: 18, marginTop: 8 }}>{event.dataFirebase_nameEvent}</Text>
                        </View>
                    </View>


                </View>

                <View style={styles.separator} />


                <View>
                    <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 15, alignSelf: 'center' }}>
                        {event.dataFirebase_dateEvent.toDate().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </Text>
                </View>
                <View style={styles.containerInfoEvent}>
                    <View style={styles.iconText}>
                        <Icon name="location-arrow" color={'blue'} size={15} />
                        <Text style={styles.iconTextItem}>{event.dataFirebase_locationEvent}</Text>
                    </View>

                    <View style={styles.iconText}>
                        <Icon name="clock-o" color={'blue'} size={15} />
                        <Text style={styles.iconTextItem}>
                            {event.dataFirebase_timeEvent.toDate().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })}
                        </Text>
                    </View>

                    <View style={styles.iconText}>
                        <Icon name="users" color={'blue'} size={15} />
                        <Text style={styles.iconTextItem}>
                        {`${event.dataFirebase_countParticipants} / ${event.dataFirebase_limitParticipants}`}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 15, alignSelf: 'center' } }>Participants</Text>
                </View>

           
        
            <TouchableOpacity style={styles.icon} onPress={() => { router.back() }} >
                <Icon name="arrow-left" color={'#4CAF50'} size={22} />
            </TouchableOpacity>
            <View>
                <Text style={styles.title}>Détail de l’événement</Text>
                <Text>ID de l’événement : {id}</Text>
            </View>
            <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinEvent(id, event.dataFirebase_autoValidate)}
            >
                <Text style={styles.joinButtonText}>
                    {event.dataFirebase_autoValidate
                        ? "Rejoindre l'activité"
                        : hasRequested
                            ? "Annuler la demande"
                            : "Demander à rejoindre"}
                </Text>
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC',
        padding: 5, // marges générales sur tout l'écran
    },
    TopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20, // espace en bas du bloc
        padding: 12,

    },
    containerOrga: {

        flexDirection: 'row',
        // justifyContent:'center',
        // alignItems:'center'
    },
    containerOrgaText: {

        flexDirection: 'column',
        justifyContent: 'center',

    },
    containerInfoEvent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        // marginTop: 10,
    },

    iconText: {
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        marginHorizontal: 10, 
      },

    iconTextItem: {
        marginTop:2,
        marginLeft: 6,
        fontFamily: 'Baloo2_600SemiBold', // ✅ police Baloo
        fontSize: 12,
        color: 'black',
      },
    topTitreAndDate: {
        flexDirection: 'column',
        marginLeft: 16, // espace entre l'image et le texte
    },
    middleDateTimePart: {
        flexDirection: "row",
        alignSelf: 'center',
        justifyContent: 'space-between',
        width: 150,
    },
    title: {
        color: '#4CAF50',
        fontFamily: 'Baloo2_800ExtraBold',
        fontWeight: 'bold',
        fontSize: 25,
        marginTop: 5,
        marginLeft: 10,
        marginBottom: 5,
    },
    icon: {
        padding: 5,
        position: 'absolute',
        left: width * 0.9,
        top: width * 0.05,
    },
    profileImage: {
        width: 80,             // largeur de l’image
        height: 80,            // hauteur de l’image
        borderRadius: 40,      // la moitié de la largeur/hauteur → cercle parfait
        borderWidth: 2,        // optionnel : pour un bord
        borderColor: '#fff',   // optionnel : couleur du bord
    },
    joinButton: {
        marginTop: 20,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    joinButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: '#4CAF50',
        marginVertical: 15,
        width: '80%',
        alignSelf: 'center',
      },
});