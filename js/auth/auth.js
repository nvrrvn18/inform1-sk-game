async function mulaiBelajar(){

const nama =
document.getElementById("nama").value;


const kelas =
document.getElementById("kelas").value;



// membuat akun anonim

const {

data,
error

}= await supabaseClient.auth.signInAnonymously();



if(error){

alert(error.message);

return;

}



const userId =
data.user.id;



// simpan profil siswa

const {error:insertError}
=
await supabaseClient

.from("students")

.insert({

user_id:userId,

nama:nama,

kelas:kelas

});



if(insertError){

console.log(insertError);

return;

}



window.location.href="index.html";


}
