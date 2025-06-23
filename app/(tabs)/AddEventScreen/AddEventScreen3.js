import { useRouter } from 'expo-router';
import { addDoc, collection } from "firebase/firestore";
import { useContext, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from '../../../firebaseConfig';

import { datasAddEventScreen } from './MyContext';
import SVG from './playschoolAddEvent3.svg';

const { width, height } = Dimensions.get('window');

export default function AddEventScreen3() {

    const {allDatas, setAllDatas} = useContext(datasAddEventScreen);

    const router = useRouter()

    const [nbAdults, setNbAdults] = useState(1);
    const [nbChildren, setNbChildren] = useState(1);
    const [limitPart, setLimitPart] = useState(10);
    const [autoValidate, setAutoValidate] = useState(false);

    const uid = auth.currentUser.uid;
    const handleSubmit = async () => {
        try {
            const finalData = {
        
                // dataFirebase_nameEvent 
                // dataFirebase_locationEvent
                // dataFirebase_dateEvent
                // dataFirebase_timeEvent
                // dataFirebase_description
                // dataFirebase_selectedChildren
                // dataFirebase_usersParticipants: qui renvoit un tableau de participant avec selectedChildren et userId si il est accompagnant
                // userId: uid,
                // createdAt: new Date()
            };

            // Ajoute dans la collection globale "Events"
            await addDoc(collection(db, "Events"), finalData);

            // Redirection
            router.push('/MainScreen/Home');
        } catch (error) {
            console.error("Erreur Firestore :", error);
            Alert.alert("Erreur", "Enregistrement échoué.");
        }
      };
    return (
        <View style={styles.container}>
        
            <Text>
                {uid}
            </Text>

            <View style={styles.topContainer}>
                <SVG width="70" height="100" />
                <Text style={styles.title}>
                    On sera combien ?
                </Text>
                <TouchableOpacity style={styles.icon} onPress={() => { router.back() }} >
                    <Icon name="arrow-left" color={'#4CAF50'} size={22} />
                </TouchableOpacity>
            </View>
            <Text>{"Je serai présent en tant qu'organisateur, suis-je accompagné ?"}</Text>
            <View style={styles.setValuesContainer}>
                <View style={styles.counterContainer}>
                    <Text style={styles.label}>Adultes :</Text>
                    <View style={styles.counterControls}>
                        <TouchableOpacity onPress={() => setNbAdults(prev => Math.max(0, prev - 1))}>
                            <Text style={styles.counterBtn}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{nbAdults}</Text>
                        <TouchableOpacity onPress={() => setNbAdults(prev => prev + 1)}>
                            <Text style={styles.counterBtn}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.counterContainer}>
                    <Text style={styles.label}>Enfants :</Text>
                    <View style={styles.counterControls}>
                        <TouchableOpacity onPress={() => setNbChildren(prev => Math.max(0, prev - 1))}>
                            <Text style={styles.counterBtn}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{nbChildren}</Text>
                        <TouchableOpacity onPress={() => setNbChildren(prev => prev + 1)}>
                            <Text style={styles.counterBtn}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text>Est-ce que tu veux limiter le nombre de participants ?</Text>
                <View style={styles.counterContainer}>
                    <Text style={styles.label}>Limite :</Text>
                    <View style={styles.counterControls}>
                        <TouchableOpacity onPress={() => setLimitPart(prev => Math.max(0, prev - 1))}>
                            <Text style={styles.counterBtn}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>{limitPart}</Text>
                        <TouchableOpacity onPress={() => setLimitPart(prev => prev + 1)}>
                            <Text style={styles.counterBtn}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    <Text>Souhaites-tu valider automatiquement la présence des participants ?</Text>

                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => setAutoValidate(true)}
                            style={{
                                backgroundColor: autoValidate === true ? 'blue' : 'grey',
                                padding: 10,
                                marginRight: 10,
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{ color: 'white' }}>Oui</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setAutoValidate(false)}
                            style={{
                                backgroundColor: autoValidate === false ? 'blue' : 'grey',
                                padding: 10,
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{ color: 'white' }}>Non</Text>
                        </TouchableOpacity>
                    </View>
                    {autoValidate === false && (
                        <Text style={{ color: '#333' }}>
                            {"Une demande d'acceptation te sera envoyée lorsqu'une personne souhaite rejoindre ton activité."}
                        </Text>
                    )}
                    {autoValidate === true && (
                        <Text style={{ color: '#333' }}>
                            {"Pas de demande d'acceptation, la personne rejoint directement ton activité"}
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Confirmation",
                                "Souhaites-tu vraiment valider l'activité ?",
                                [
                                    { text: "Annuler", style: "cancel" },
                                    {
                                        text: "Confirmer",
                                        onPress: handleSubmit
                                    }
                                ]
                            );
                        }}
                        style={{
                            backgroundColor: '#4CAF50',
                            marginTop: 20,
                            padding: 12,
                            borderRadius: 5,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            {"Valider l'activité"}
                        </Text>
                    </TouchableOpacity>
                </View>


                
            </View>

        </View>

        
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC'
    },
    topContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    setValuesContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    setAdultValueContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%', // Ajuste la largeur du conteneur parent
        marginVertical: 10 // Ajoute de l'espace autour des éléments
    },
    input: {
        width: 200,
        height: 40,
        margin: 12,
        borderBottomWidth: 1,
        padding: 10,
    },

    icon: {
        padding: 5,
        position: 'absolute',
        left: width * 0.9,
        top: width * 0.05,
    },

    title: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 20
    },

    counterContainer: {
        flexDirection:'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    counterBtn: {
        fontSize: 28,
        paddingHorizontal: 15,
        color: '#2196F3',
    },
    counterValue: {
        fontSize: 20,
        marginHorizontal: 10,
      },
});