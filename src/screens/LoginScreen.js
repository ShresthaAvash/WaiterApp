import React, {useState, useContext} from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import {AuthContext} from '../context/AuthContext';
const LoginScreen = () => {
const [email, setEmail] = useState(''); // Changed from username
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const {login} = useContext(AuthContext);
const handleLogin = async () => {
if (!email || !password) {
Alert.alert('Error', 'Please enter both email and password.');
return;
}
setLoading(true);
const success = await login(email, password); // Pass email
setLoading(false);
if (!success) {
Alert.alert('Login Failed', 'Invalid email or password.');
}
};
return (
<View style={styles.container}>
<Text style={styles.title}>Waiter Login</Text>
<TextInput
style={styles.input}
placeholder="Email" // Changed placeholder
value={email}
onChangeText={setEmail} // Changed handler
autoCapitalize="none"
keyboardType="email-address" // Set keyboard type for email
/>
<TextInput
style={styles.input}
placeholder="Password"
value={password}
onChangeText={setPassword}
secureTextEntry
/>
{loading ? (
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