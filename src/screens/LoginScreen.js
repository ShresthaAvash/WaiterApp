import React, {useState, useContext} from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import {AuthContext} from '../context/AuthContext';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {login, isLoading} = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        
        const success = await login(email, password);

        if (!success) {
            Alert.alert('Login Failed', 'Invalid email or password.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Waiter Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            {isLoading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
});

export default LoginScreen;