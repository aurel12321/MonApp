import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { addDoc, collection, doc, getDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db } from "../../../firebaseConfig"; // ajuste le chemin selon ton projet
import SVG from "./playschoolAddEvent1.svg";

export default function AddEventScreen() {
    const router = useRouter();

    const [eventName, setEventName] = useState("");
    const [eventDescription, setEventDescription] = useState("");

    const [inputVille, setInputVille] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [ville, setVille] = useState("");

    
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [hasSelectedDate, setHasSelectedDate] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hasSelectedTime, setHasSelectedTime] = useState(false);

    const [userChildren, setUserChildren] = useState([]);

    const [selectedChildren, setSelectedChildren] = useState([]);

    const [willSupervise, setWillSupervise] = useState(null);


    const [limitPart, setLimitPart] = useState(5);
    const [autoValidate, setAutoValidate] = useState(null); 

    useEffect(() => {
        if (inputVille.includes(" - ")) {
            setSuggestions([]);
            return;
        }
        const fetchCities = async () => {
            if (inputVille.length > 2) {
                try {
                    const response = await fetch(
                        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
                            inputVille
                        )}&type=municipality&limit=3`
                    );
                    const json = await response.json();
                    setSuggestions(Array.isArray(json.features) ? json.features : []);
                } catch (error) {
                    console.log(error);
                }
            } else {
                setSuggestions([]);
            }
        };
        const timer = setTimeout(fetchCities, 300);
        return () => clearTimeout(timer);
    }, [inputVille]);

    const handleSubmit = async () => {
        const dateF = new Date(date);
        dateF.setHours(0, 0, 0, 0);
        const firebaseDate = Timestamp.fromDate(dateF);
        const firebaseTime = Timestamp.fromDate(time);

        try {
            const auth = getAuth();
            const uid = auth.currentUser.uid;

            const usersParticipants = selectedChildren.map(index => ({
                child: userChildren[index],
                ...(willSupervise && { userId: uid }) // Ajoute userId si nécessaire
            }));

            // 🔢 Calcul du nombre total de participants
            const participantsArray = usersParticipants || [];
            let totalParticipants = 0;

            participantsArray.forEach(participant => {
                if (participant) {
                    const child = participant.child;

                    // Cas enfant unique ou tableau
                    if (Array.isArray(child)) {
                        totalParticipants += child.length;
                    } else if (child && typeof child === 'object') {
                        totalParticipants += 1;
                    }

                    // Ajoute 1 si un parent accompagnateur est présent
                    if (participant.userId) {
                        totalParticipants += 1;
                    }
                }
            });

            const eventData = {
                dataFirebase_nameEvent: eventName,
                dataFirebase_locationEvent: ville,
                dataFirebase_dateEvent: firebaseDate,
                dataFirebase_timeEvent: firebaseTime,
                dataFirebase_description: eventDescription,
                dataFirebase_selectedChildren: selectedChildren.map(index => userChildren[index]),
                dataFirebase_usersParticipants: usersParticipants,
                dataFirebase_limitParticipants: limitPart,
                dataFirebase_countParticipants: totalParticipants, 
                userId: uid,
                createdAt: new Date(),
            };

            await addDoc(collection(db, "Events"), eventData);

            Alert.alert("Succès", "L'activité a été créée avec succès !");
            // Navigation ou reset du formulaire ici
        } catch (error) {
            console.error("Erreur lors de la création de l'activité :", error);
            Alert.alert("Erreur", "Une erreur est survenue lors de la création de l'activité.");
        }
    };
    
    const toggleChildSelection = (index) => {
        setSelectedChildren((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((i) => i !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };


    useEffect(() => {
        const fetchUserChildren = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "Users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.dataFirebase_userChildren) {
                        setUserChildren(userData.dataFirebase_userChildren);
                    }
                } else {
                    console.log("No user document found");
                }
            }
        };

        fetchUserChildren();
    }, []);

    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <SVG width="70" height="100" />
                    <Text style={styles.topTitle}>
                        Dis moi en plus sur ton activité...
                    </Text>
                    <TouchableOpacity
                        style={styles.buttonBack}
                        onPress={() => {
                            router.replace("/LoginScreen/LoginScreen");
                        }}
                    >
                        <Icon name="arrow-left" color="#F8F8F8" size={22} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ backgroundColor: "#B3E5FC", padding: 20 }}>
                    <Text
                        style={{ fontSize: 20, fontWeight: "bold", marginBottom: 15 }}
                    >
                        Ajouter une activité :
                    </Text>

                    <TextInput
                        placeholder="Nom de l'événement"
                        value={eventName}
                        onChangeText={setEventName}
                        style={styles.input}
                        placeholderTextColor="#8B4513"
                    />

                    <TextInput
                        placeholder="Dans quelle ville"
                        value={ville || inputVille}
                        onChangeText={(text) => {
                            setVille("");
                            setInputVille(text);
                        }}
                        style={styles.input}
                        placeholderTextColor="#8B4513"
                    />
                    {suggestions.map((s, i) => {
                        const city = s.properties.city;
                        const postcode = s.properties.postcode;
                        const formatted = `${city} - ${postcode}`;
                        const villeF = `${city}`
                        return (
                            <TouchableOpacity
                                key={i}
                                onPress={() => {
                                    setVille(villeF);
                                    setInputVille(formatted);
                                    setSuggestions([]);
                                }}
                                style={styles.suggestionItem}
                            >
                                <Text>{formatted}</Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* === PICKER DATE === */}
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <View style={styles.containerBirth}>
                        
                            <Text style={styles.labelBirth}>
                                {hasSelectedDate
                                    ? date.toLocaleDateString("fr-FR")
                                    : "Sélectionner une date"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <Modal
                        visible={showDatePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowDatePicker(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={date || new Date()}
                                    mode="date"
                                    display="spinner"
                                    locale="fr"
                                    onChange={(event, selectedDate) => {
                                        if (event.type === "set" && selectedDate) {
                                            setDate((prev) => {
                                                const nd = new Date(prev);
                                                nd.setFullYear(
                                                    selectedDate.getFullYear(),
                                                    selectedDate.getMonth(),
                                                    selectedDate.getDate()
                                                );
                                                return nd;
                                            });
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
                                    <Text
                                        style={{
                                            fontFamily: "Baloo2_600SemiBold",
                                            color: "white",
                                        }}
                                    >
                                        Valider
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    {/* === PICKER HEURE === */}
                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                        <View style={styles.containerBirth}>
                            <Text style={styles.labelBirth}>
                                {hasSelectedTime
                                    ? date.toLocaleTimeString("fr-FR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })
                                    : "Sélectionner une heure"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <Modal
                        visible={showTimePicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowTimePicker(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <DateTimePicker
                                    value={time || new Date()}
                                    mode="time"
                                    display="spinner"
                                    locale="fr"
                                    onChange={(event, selectedTime) => {
                                        if (event.type === "set" && selectedTime) {
                                            setTime(selectedTime); // on ne modifie que tempTime ici
                                        }
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => {
                                        setDate(prev => {
                                            const newDate = new Date(prev);
                                            newDate.setHours(time.getHours(), time.getMinutes());
                                            return newDate;
                                        });
                                        setHasSelectedTime(true);
                                        setShowTimePicker(false);
                                    }}
                                    style={styles.validateButton}
                                >
                                    <Text style={{
                                        fontFamily: "Baloo2_600SemiBold",
                                        color: "white",
                                    }}>
                                        Valider
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    <TextInput
                        placeholder="Ajoute une description"
                        value={eventDescription}
                        onChangeText={setEventDescription}
                        multiline
                        style={[styles.input, { height: 100 }]}
                        placeholderTextColor="#8B4513"
                    />

                    <View
                        style={{
                            flexDirection: "column",
                            alignItems: "center",
                            marginTop: 10,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: "Baloo2_600SemiBold",
                                fontSize: 18,
                                marginRight: 10,
                            }}
                        >
                            Participant(s) :
                        </Text>
                        {userChildren.length > 0 && userChildren.map((child, index) => {
                            const isSelected = selectedChildren.includes(index);
                            return (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginVertical: 5,
                                        backgroundColor: isSelected ? "#E0F7FA" : "transparent",
                                        padding: 8,
                                        borderRadius: 8,
                                    }}
                                >
                                    {/* Toute la zone cliquable = emoji + nom */}
                                    <TouchableOpacity
                                        onPress={() => toggleChildSelection(index)}
                                        style={{ flexDirection: "row", alignItems: "center", width:'40%' }}
                                    >
                                        <Text style={{ fontSize: 30, marginRight: 10 }}>
                                            {child.gender === "F" ? "👧" : "👦"}
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: "Baloo2_600SemiBold",
                                                color: "#8B4513",
                                                fontSize: 16,
                                            }}
                                        >
                                            {child.name}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Icône de sélection (affichage uniquement) */}
                                    <View
                                        style={{
                                            width: 24,
                                            height: 24,
                                            marginLeft: 10,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text style={{ color: isSelected ? "#4CAF50" : "#FF0000", fontSize: 16 }}>
                                            {isSelected ? "✅" : "❌"}
                                        </Text>
                                    </View>
                                </View>
                              
                            );
                        })}

                        <View style={{ marginTop: 10, alignItems: "center" }}>
                            <Text
                                style={{
                                    fontFamily: "Baloo2_600SemiBold",
                                    fontSize: 15,
                                    marginBottom: 10,
                                 
                                }}
                            >
                                {`Je suis accompagnant lors de l'activité :`}
                            </Text>

                            <View style={{ flexDirection: "row", gap: 15 }}>
                                <TouchableOpacity
                                    onPress={() => setWillSupervise(true)}
                                    style={{
                                        backgroundColor: willSupervise === true ? '#4CAF50' : '#B3E5FC',
                                        borderWidth: 2,
                                        borderColor: '#191970',
                                        borderRadius: 6,
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    <Text style={{ color: "#8B4513", fontFamily: "Baloo2_600SemiBold", }}>
                                        Oui
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setWillSupervise(false)}
                                    style={{
                                        backgroundColor: willSupervise === false ? '#4CAF50' : '#B3E5FC',
                                        borderWidth: 2,
                                        borderColor: '#191970',
                                        borderRadius: 6,
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    <Text style={{ color: "#8B4513"  ,   fontFamily: "Baloo2_600SemiBold", }}>
                                        Non
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ marginTop: 20, width: "90%" }}>
                            <Text
                                style={{
                                    fontFamily: "Baloo2_600SemiBold",
                                    fontSize: 15,
                                    marginBottom: 10,
                                 
                                }}
                            >
                                Combien de participants maximum ?
                            </Text>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignSelf: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 20,
                                }}
                            >
                              
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 20,
                                    }}
                                >
                                    <TouchableOpacity onPress={() => setLimitPart(prev => Math.max(2, prev - 1))}>
                                        <Text
                                            style={{
                                                fontSize: 22,
                                             
                                                paddingHorizontal: 10,
                                                paddingVertical: 5,
                                                borderRadius: 5,
                                            }}
                                        >
                                            -
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 18 }}>{limitPart}</Text>
                                    <TouchableOpacity onPress={() => setLimitPart(prev => prev + 1)}>
                                        <Text
                                            style={{
                                                fontSize: 22,
                                              
                                                paddingHorizontal: 10,
                                                paddingVertical: 5,
                                                borderRadius: 5,
                                            }}
                                        >
                                            +
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text
                                style={{
                                    fontFamily: "Baloo2_600SemiBold",
                                    fontSize: 15,
                              
                                    marginBottom: 10,
                                }}
                            >
                                Souhaites-tu valider automatiquement la présence des participants ?
                            </Text>

                            <View style={{ flexDirection: 'row', justifyContent:'center', gap:15 }}>
                                <TouchableOpacity
                                    onPress={() => setAutoValidate(true)}
                                    style={{
                                        backgroundColor: autoValidate === true ? '#4CAF50' : '#B3E5FC',
                                        borderWidth: 2,
                                        borderColor: '#191970',
                                        borderRadius: 6,
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    <Text style={{ color: "#8B4513", fontFamily: "Baloo2_600SemiBold" }}>Oui</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setAutoValidate(false)}
                                    style={{
                                        backgroundColor: autoValidate === false ? '#4CAF50' : '#B3E5FC',
                                        borderWidth: 2,
                                        borderColor: '#191970',
                                        borderRadius: 6,
                                        paddingVertical: 8,
                                        paddingHorizontal: 16,
                                    }}
                                >
                                    <Text style={{ color: "#8B4513", fontFamily: "Baloo2_600SemiBold" }}>Non</Text>
                                </TouchableOpacity>
                            </View>

                            {autoValidate === false && (
                                <Text style={{ color: 'red', fontSize: 13, marginTop:5}}>
                                    {`Une demande d'acceptation te sera envoyée lorsqu'une personne souhaite rejoindre ton activité.`}
                                </Text>
                            )}
                            {autoValidate === true && (
                                <Text style={{ color: 'red', fontSize: 13, marginTop:5 }}>
                                    {`Pas de demande d'acceptation, on peut rejoindre l'activité sans ton autorisation.`}
                                </Text>
                            )}
                        </View>

                        <View style={{ marginTop: 20, alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        "Confirmation",
                                        "Souhaites-tu vraiment valider l'activité ?",
                                        [
                                            { text: "Annuler", style: "cancel" },
                                            {
                                                text: "Confirmer",
                                                onPress: handleSubmit,
                                            },
                                        ]
                                    );
                                }}
                                style={{
                                    backgroundColor: '#4CAF50',
                                    padding: 12,
                                    borderRadius: 8,
                                    alignItems: 'center',
                                    width: '80%',
                                }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                    {`Valider l'activité`}
                                </Text>
                            </TouchableOpacity>
                        </View>


                    </View>

                  
                    
                </ScrollView>

            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = {
    container: { flex: 1, backgroundColor: "#B3E5FC"},
    topContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    topTitle: {
        fontFamily: "Baloo2_800ExtraBold",
        fontSize: 20,
        width: "70%",
        color: "#4CAF50",
        marginLeft: 10,
    },
    buttonBack: {
        marginLeft: "auto",
    },
    input: {
        borderWidth: 2,
        borderColor: "#191970",
        borderRadius: 6,
        padding: 10,
        marginVertical: 8,
        color: "#8B4513",
        fontFamily: "Baloo2_600SemiBold",
        fontSize: 16,
    },
    suggestionItem: {
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
    },
    containerBirth: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#191970",
        borderRadius: 6,
        padding: 12,
        marginVertical: 8,
    
    },
    labelBirth: {
        fontSize: 16,
        marginRight:2,
        color: "#8B4513",
        fontFamily: "Baloo2_600SemiBold",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    validateButton: {
        backgroundColor: "#4CAF50",
        padding: 12,
        marginTop: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    suivantButton: {
        width: 200,
        
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
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
};
