import {
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/baloo-2';
import { useRouter } from "expo-router";
import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { auth, db } from "../../../firebaseConfig";
import SVG from '../AddEventScreen/playschoolAddEvent2.svg';
export default function AddChildScreen() {
   
    const [fontsLoaded] = useFonts({
        Baloo2_400Regular,
        Baloo2_600SemiBold,
        Baloo2_800ExtraBold,
    });
   
    const router = useRouter();
    const uid = auth.currentUser.uid;

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('H'); // H ou F
    const [description, setDescription] = useState('');

    const handleAdd = async () => {
        if (!name || !age || !gender || !description) {
            Alert.alert("Erreur", "Merci de remplir tous les champs.");
            return;
        }

        const newChild = {
            name,
            age: parseInt(age),
            gender,
            description
        };

        try {
            await setDoc(doc(db, "Users", uid), {
                dataFirebase_userChildren: arrayUnion(newChild),
            });

            Alert.alert("Succès", "Enfant ajouté !");
            router.back(); // Retour à l’écran précédent
        } catch (error) {
            console.error("Erreur Firestore :", error);
            Alert.alert("Erreur", "Impossible d'ajouter l'enfant.");
        }
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
        <View style={styles.container}>


              <View style={styles.topContainer}>
                                <SVG width="60" height="100" ></SVG>
            
                                <Text style={styles.topTitle}>{`Et nous ?`}</Text>
            
                             
            
                            </View>

         
            <TextInput
                placeholder="Nom de l'enfant"
                placeholderTextColor="#8B4513"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Âge de l'enfant"
                placeholderTextColor="#8B4513"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                style={styles.input}
            />

            <Text style={styles.label}>Sexe</Text>
            <View style={styles.radioContainer}>
                <TouchableOpacity
                    style={[
                        styles.radioButton,
                        gender === 'H' && styles.radioSelected
                    ]}
                    onPress={() => setGender('H')}
                >
                    <Text style={styles.radioText}>H</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.radioButton,
                        gender === 'F' && styles.radioSelected
                    ]}
                    onPress={() => setGender('F')}
                >
                    <Text style={styles.radioText}>F</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Description"
                placeholderTextColor="#8B4513"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 80 }]}
                multiline
            />
            

            <TouchableOpacity onPress={handleAdd} style={styles.button}>
                <Text style={styles.buttonText}>Ajouter</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={[styles.button, { backgroundColor: '#aaa' }]}>
                <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
        </View>
        </KeyboardAwareScrollView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#B3E5FC' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#8B4513', textAlign: 'center' },
    label: { fontSize: 16, marginBottom: 5, color: '#8B4513', fontFamily: 'Baloo2_600SemiBold', },
    input: {
        borderWidth: 2,
        borderColor: '#191970',
        fontFamily: 'Baloo2_600SemiBold',
        borderRadius: 6,
        padding: 10,
        marginBottom: 15,
        color: '#8B4513',
       
    },
    topTitle: {
        fontFamily: 'Baloo2_800ExtraBold', // tu peux garder celle-ci plus "bold"
        fontSize: 20,
        color: '#4CAF50',
        marginLeft: 10,
    },
    topContainer: {

        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    radioButton: {
        borderWidth: 2,
        borderColor: '#191970',
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    
    },
    radioSelected: {
        backgroundColor: '#4CAF50',
    },
    radioText: {
        color: '#8B4513',
        fontFamily: 'Baloo2_600SemiBold',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 14,
        borderRadius: 6,
        marginBottom: 10,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
