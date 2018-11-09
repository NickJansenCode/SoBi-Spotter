<?php
$link = 'https://opendata.arcgis.com/datasets/b5fb1c2cbccc4513ad4cac3671905ccc_18.csv';
$sobiArray = array();

$file = file($link,FILE_SKIP_EMPTY_LINES);
$csv = array_map("str_getcsv",$file, array_fill(0, count($file), ','));
$keys = array_shift($csv);

//echo json_encode($csv);

foreach($csv as $x){
    $sobiArray[] =
    array('long' => $x[0],
  	      'lat' => $x[1],
  	      'name' => $x[3],
  	      'desc' => $x[4],
  	     );
}

echo json_encode ($sobiArray);