import {
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/baloo-2';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import { auth, db } from "../../../firebaseConfig"; // adapte le chemin
import SVG from './playschoolAddEvent1.svg';

export default function ProfilRegisterScreen() {

    const uid = auth.currentUser.uid;
    console.log(uid);
    const [fontsLoaded] = useFonts({
        Baloo2_400Regular,
        Baloo2_600SemiBold,
        Baloo2_800ExtraBold,
    });

    const router = useRouter();

    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [sexe, setSexe] = useState("F");
    const [descritpion, setDescription] = useState("");

    const [hasSelectedDate, setHasSelectedDate] = useState(false);
    const [dateNaissance, setDateNaissance] = useState(new Date());

    const [inputVille, setInputVille] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [ville, setVille] = useState("");

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [userChildren, setUserChildren] = useState('');


    useEffect(() => {
        if (inputVille.includes(" - ")) {
            setSuggestions([]);  // On vide les suggestions
            return;
        }
        const getLocationFromApi = async () => {
            if (inputVille.length > 2) {
                try {
                    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(inputVille)}&limit=3`);
                    const json = await response.json();
                    setSuggestions(json.features);
                } catch (error) {
                    console.log(error);
                }
            } else {
                setSuggestions([]);
            }
        };

        const debounceTimer = setTimeout(getLocationFromApi, 300); // éviter les appels trop rapides
        return () => clearTimeout(debounceTimer);
    }, [inputVille]);


    useFocusEffect(
        useCallback(() => {
            const fetchChildren = async () => {
                try {
                    const userDoc = await getDoc(doc(db, "Users", uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        const enfants = data.dataFirebase_userChildren || [];
                        setUserChildren(enfants);
                    }
                } catch (error) {
                    console.error("Erreur lors du chargement des enfants :", error);
                }
            };

            fetchChildren();
        }, [])
    );



    const handleChangeDate = (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
            setDateNaissance(selectedDate);
        }
        // setShowDatePicker(false)
    };

    const handleSaveProfile = async () => {
        try {

            console.log(uid)
            const dateF = new Date(dateNaissance);
            dateF.setHours(0, 0, 0, 0);

            await setDoc(doc(db, "Users", uid), {
                dataFirebase_prenomUser: prenom,
                dataFirebase_nomUser: nom,
                dataFirebase_sexeUser: sexe,
                dateFirebase_dateNaissanceUser: dateF,
                dataFirebase_villeUser: ville,
                dataFirebase_description: descritpion,
                dataFirebase_userChildren: userChildren

            });

            Alert.alert("Profil enregistré !");
            router.replace("/MainScreen/home");
        } catch (error) {
            console.error(error);
            Alert.alert("Erreur", "Impossible d'enregistrer le profil.");
        }
    };






    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>

            <View style={styles.container}>

                <View style={styles.topContainer}>
                    <SVG width="70" height="100" ></SVG>

                    <Text style={styles.topTitle}>{`Nouveau sur l'appli ?`}</Text>

                    <TouchableOpacity style={styles.buttonBack} onPress={() => { router.replace("/LoginScreen/LoginScreen") }} >
                        <Icon name="arrow-left" color='#F8F8F8' size={22} />
                    </TouchableOpacity>

                </View>

                <ScrollView keyboardShouldPersistTaps="handled">

                    <View>
                        <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 18 }}>Complète ton profil:</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity
                                onPress={() => setSexe('F')}
                                style={{
                                    backgroundColor: sexe === 'F' ? '#4CAF50' : '#B3E5FC',
                                    borderWidth: 2,
                                    padding: 10,
                                    margin: 10,
                                    borderRadius: 5,
                                    borderColor: '#191970'
                                }}
                            >
                                <Text style={styles.textSexe} >Femme</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setSexe('H')}
                                style={{
                                    backgroundColor: sexe === 'H' ? '#4CAF50' : '#B3E5FC',
                                    borderWidth: 2,
                                    padding: 10,
                                    margin: 10,
                                    borderRadius: 5,
                                    borderColor: '#191970'
                                }}
                            >
                                <Text style={styles.textSexe}>Homme</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} style={styles.input} keyboardType="default" placeholderTextColor='#8B4513' />
                        <TextInput placeholder="Nom" value={nom} onChangeText={setNom} style={styles.input} placeholderTextColor='#8B4513' />

                        <View>
                            <TextInput
                                placeholder="Ville de résidence"
                                value={ville || inputVille}
                                keyboardType="default"
                                onChangeText={(text) => {
                                    setVille("");            // Reset si l’utilisateur modifie
                                    setInputVille(text);     // Provoque une recherche
                                }}
                                style={styles.input}
                                placeholderTextColor="#8B4513"
                            />

                            {suggestions.map((s, i) => {
                                const city = s.properties.city;
                                const postcode = s.properties.postcode;

                                return (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => {
                                            const formatted = `${city} - ${postcode}`;
                                            setVille(formatted);         // pour Firestore
                                            setInputVille(formatted);    // pour affichage dans input
                                            setSuggestions([]);          // on cache les suggestions
                                        }}
                                        style={{ padding: 10, backgroundColor: '#fff', borderBottomWidth: 1 }}
                                    >
                                        <Text>{`${city} - ${postcode}`}</Text>
                                    </TouchableOpacity>
                                );
                            })}


                        </View>


                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <View style={styles.containerBirth}>

                                <Text style={styles.labelBirth}>Né(e) le :</Text>

                                <Text style={styles.labelBirth}>{hasSelectedDate ? dateNaissance.toLocaleDateString('fr-FR') : 'jj/mm/aaaa'}</Text>


                                <Modal
                                    visible={showDatePicker}
                                    transparent={true}
                                    animationType="slide"
                                    onRequestClose={() => setShowDatePicker(false)}
                                >
                                    <View style={styles.modalContainer}>
                                        <View style={styles.modalContent}>
                                            <DateTimePicker
                                                value={dateNaissance}
                                                mode="date"
                                                display="spinner"
                                                locale="fr"
                                                onChange={(event, selectedDate) => {
                                                    if (event.type === 'set' && selectedDate) {
                                                        setDateNaissance(selectedDate);
                                                    }
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setHasSelectedDate(true);
                                                    setShowDatePicker(false);
                                                }}
                                                style={styles.validateButton}
                                            >
                                                <Text style={{ fontFamily: 'Baloo2_600SemiBold', color: 'white' }}>Valider</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>

                            </View>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.descriptionArea}
                            placeholder="Écris une petite description..."
                            placeholderTextColor="#8B4513"
                            editable
                            multiline
                            // numberOfLines={4}

                            onChangeText={text => setDescription(text)}
                            value={descritpion} // corrige le nom ici si tu avais écrit "descitpion" par erreur
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 , marginBottom:15}}>
                            <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 15, marginRight: 10 }}>
                                Tu as des enfants ? Ajoute un profil :
                            </Text>

                            <TouchableOpacity onPress={() => router.push('/MainScreen/AddChildScreen')}>
                                <Icon name="plus" color='#2196F3' size={28} />
                            </TouchableOpacity>
                        </View>
                        



                        {userChildren.length > 0 && (
                            <FlatList
                                scrollEnabled={false}
                                data={userChildren}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 24, marginRight: 10 }}>
                                            {item.gender === 'F' ? '👧' : '👦'}
                                        </Text>
                                        <Text style={{ fontFamily: 'Baloo2_600SemiBold', color: '#8B4513', fontSize: 16 }}>
                                            {item.name} - {item.age} ans
                                        </Text>
                                    </View>
                                )}
                            />
                        )}


                    </View>

                </ScrollView>

                <TouchableOpacity style={styles.suivantButton} onPress={handleSaveProfile}>
                    <Text style={styles.suivantText}>Suivant</Text>
                </TouchableOpacity>


            </View>
        </KeyboardAwareScrollView>

    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#B3E5FC',
        paddingHorizontal: 10,
    },
    // containerProfil: {
    //     flex:1

    // },
    text: {
        fontFamily: 'Baloo2_400Regular',
    },
    topContainer: {

        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    topTitle: {
        fontFamily: 'Baloo2_800ExtraBold', // tu peux garder celle-ci plus "bold"
        fontSize: 20,
        color: '#4CAF50',
        marginLeft: 10,
    },
    textSexe: {

        borderRadius: 6,
        // borderColor: '#8B4513',
        fontFamily: 'Baloo2_600SemiBold',
        color: '#8B4513'
    },
    input: {
        borderWidth: 2,
        padding: 10,
        marginVertical: 8,
        borderRadius: 6,
        fontFamily: 'Baloo2_600SemiBold', // aussi ici pour les inputs
        borderColor: '#191970',
        color: '#8B4513'

    },

    suggestionContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        maxHeight: 150,
        marginTop: -8,
        marginBottom: 8,
        zIndex: 999, // pour que ça passe par-dessus les autres vues
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontFamily: 'Baloo2_600SemiBold',
        color: '#8B4513'
    },

    containerBirth: {
        flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'center',
        borderWidth: 2,
        padding: 10,
        marginVertical: 8,
        borderRadius: 6,
        fontFamily: 'Baloo2_600SemiBold', // aussi ici pour les inputs
        borderColor: '#191970',

    },

    labelBirth: {
        fontFamily: 'Baloo2_600SemiBold',
        // fontSize: 16,
        marginLeft: 5,
        color: '#8B4513',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    validateButton: {
        marginTop: 15,
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    descriptionArea: {
        height: 150,
        borderWidth: 2,
        padding: 10,
        marginVertical: 8,
        borderRadius: 6,
        // textAlign: 'top',
        // textAlignVertical: 'top',
        fontFamily: 'Baloo2_600SemiBold', // aussi ici pour les inputs
        borderColor: '#191970',
        color: '#8B4513'

    },
    suivantButton: {
        width: 150,
        height: 48,
        backgroundColor: '#4CAF50',
        marginBottom: 10,
        // marginLeft: 5,
        // padding: 14,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'

    },

    suivantText: {
        color: 'white',
        fontFamily: 'Baloo2_800ExtraBold',
        fontSize: 18,
        textAlign: 'center,'
    },
    buttonBack: {
        position: 'absolute',
        top: '10%', // ou plus si tu veux qu'il soit encore plus haut
        left: '95%',
        padding: 5
    },

    addButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignSelf: 'center',

        width: '20%'
    },
    closeButtonModal: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#ddd',
    },

};