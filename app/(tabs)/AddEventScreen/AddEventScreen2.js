import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { datasAddEventScreen } from './MyContext';

import { Dimensions, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SVG from './playschoolAddEvent2.svg';


const { width, height } = Dimensions.get('window');

export default function AddEventScreen2() {

    const {allDatas, setAllDatas} = useContext(datasAddEventScreen);


    const handleNext = () => {
        const dateF= new Date(date);
        dateF.setHours(0, 0, 0, 0);
        const firebaseDate = Timestamp.fromDate(dateF);
        const firebaseTime = Timestamp.fromDate(time);

        setAllDatas({ ...allDatas, location, firebaseDate,firebaseTime })
        router.push('/AddEventScreen/AddEventScreen3')
    }
    
    const router = useRouter();
    const [input, setInput] = useState('');
    const [location, setLocation] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);

    // Fonction pour obtenir les suggestions d'adresse
    useEffect(() => {
        const getLocationFromApi = async () => {
            if (input.length > 3) {  // Ajouter un seuil pour éviter les appels inutiles
                try {
                    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(input)}&limit=5`);
                    const json = await response.json();
                    setLocation(json.features);
                } catch (error) {
                    console.log(error);
                }
            } else {
                setLocation(null); // Si l'input est trop court, ne pas afficher les suggestions
            }
        };
        getLocationFromApi();
    }, [input]);

    // Fonction de changement de date
    const handleChangeDate = (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
            setDate(selectedDate);
        }
    };

    // Fonction de changement d'heure
    const handleChangeTime = (event, selectedTime) => {
        if (event.type === 'set' && selectedTime) {
            setTime(selectedTime);
        }
    };

    // Sélectionner une adresse parmi les suggestions
    const handleSelectLocation = (selectedLocation) => {
        setInput(selectedLocation.properties.label); // Remplir l'input avec l'adresse sélectionnée
        setLocation(null); // Cacher les suggestions
    };

    return (
        <View style={styles.container}>

                   <View style={styles.topContainer}>
                                <SVG width="60" height="100" ></SVG>
                                <Text style={styles.title}>
                                    {"C'est où et quand ??"}
                                </Text>
                            <TouchableOpacity style={styles.icon} onPress={() => {router.back()}} >
                                <Icon  name="arrow-left" color={'#4CAF50'} size={22} />
                                </TouchableOpacity>
                            
                            </View>
            <View style={styles.setValuesContainer}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <TextInput
                    placeholder="Saisir une adresse"
                    value={input}
                    onChangeText={setInput}
                    style={styles.input}
                />
                </TouchableWithoutFeedback>

                {location && (
                    <FlatList
                        data={location}
                        keyExtractor={(item) => item.properties.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleSelectLocation(item)}>
                                <Text style={styles.suggestion}>{item.properties.label}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
             

                <View>

                    <DateTimePicker
                        mode="date"
                        value={date || new Date()}
                        onChange={handleChangeDate}
                    />
                </View>

                <View>

                    <DateTimePicker
                        mode="time"
                        value={time || new Date()}
                        onChange={handleChangeTime}
                    />
                </View>

                <TouchableOpacity onPress={handleNext}>
                    <Text>Continuer</Text>
                </TouchableOpacity>
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
        alignItems: 'center'
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


})