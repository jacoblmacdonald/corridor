<?php
$name = 	$_POST["name"];
$type = 	$_POST["type"];
$object = 	$_POST["object"];
$level = 	$_POST["level"];

$file = fopen($name.".txt", "w");

$name_string = "name:\n".$name."\n";
$type_string = "type:\n".$type."\n";
$level_string = "level:\n".$level."\n";
$object_string = "object:\n";
foreach ($object as $o) {
	foreach ($o as $a) {
		$object_string .= $a.",";
	}
}
$object_string .= "\n";
fwrite($file, $name_string);
fwrite($file, $type_string);
fwrite($file, $level_string);
fwrite($file, $object_string);
fclose($file);

?>