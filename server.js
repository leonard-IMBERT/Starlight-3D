const express = require('express');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'style.css'));
});

app.get('/src.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'src.js'));
});

app.get('/map.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'map.png'));
});

app.get('/skybox-face.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'skybox-face.jpg'));
});

app.get('/skybox-sky.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'skybox-sky.jpg'));
});

app.get('/skybox-sea.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'skybox-sea.jpg'));
});

app.listen(3000, () => console.log('server running  !'));
