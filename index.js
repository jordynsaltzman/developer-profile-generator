const inquirer = require("inquirer");
const fs = require("fs");
const axios = require("axios");
const generateHTML = require("./generatorHTML");
const pdf = require('html-pdf');
const readhtml = fs.readFileSync('./index.html', 'utf8');
const options = { format: 'Letter' };

let questions = [
    { input: "text", message: "What is your Github username?", name: "username" },
    { input: "text", message: "What is your favorite color?", name: "color" }
];

let dataObj = {};

let generateProfile = function () {
    const results = inquirer.prompt(questions).then(function (input) {
        axios.get(`https://api.github.com/users/${input.username}`)
            .then(function (axiosResponse) {

                dataObj.name = axiosResponse.data.name;
                dataObj.bio = axiosResponse.data.bio;
                dataObj.html_url = axiosResponse.data.html_url;
                dataObj.followers = axiosResponse.data.followers;
                dataObj.following = axiosResponse.data.following;
                dataObj.public_repos = axiosResponse.data.public_repos;
                dataObj.company = axiosResponse.data.company;
                dataObj.location = axiosResponse.data.location;
                dataObj.avatar_url = axiosResponse.data.avatar_url;
                dataObj.locationURL = 'https://www.google.com/maps/search/?api=1&query=' + dataObj.location;

                axios.get(`https://api.github.com/users/${input.username}/starred`).then(function (response) {
                    console.log(response);
                    dataObj.color = input.color;
                    let count = 0;
                    for(let i=0; i<response.data.length; i++){
                        count+=response.data[i].stargazers_count;
                    }
                    dataObj.stargazers_count = count;
                    console.log(dataObj);

                    let html = generateHTML(dataObj);
                    fs.writeFile("index.html", html, "utf-8", function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            }).then(function(){
                pdf.create(readhtml, options).toFile( "./profile.pdf",function(err, res){
                    if (err) return console.log(err);
                    console.log(res.filename);
                  });
            })       
    });

};

generateProfile();
