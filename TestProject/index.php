<?php
$connect = new PDO('mysql:host=localhost;dbname=myDatabase;charset=utf8','user','');
if(!$connect) {
	die("Problem. Unable to connect.");
} else { 
	foreach($connect->query('SELECT * FROM myTable') as $row) {
		if($row['Username'] == "jh17g14") {
			echo $row['ID'].' '.$row['Username'].' '.$row['Surname']; 
		}
   		
	}
}
?>
