<?php
//$link = 'https://opendata.arcgis.com/datasets/b5fb1c2cbccc4513ad4cac3671905ccc_18.csv';
$link = 'http://opendata.hamilton.ca/csv/sobi_hubs.csv';
$sobiArray = array();
$dumbFormatting = false;

$file = file($link);
$csv = array_map("str_getcsv",$file, array_fill(0, count($file), ','));
$keys = array_shift($csv);

//echo json_encode($csv);

for($i = 0; $i < count($csv); $i++){

	if ($dumbFormatting){
		$sobiArray[] =
    	array(
			'long' => $csv[$i][5],
  	      	'lat' => $csv[$i][6],
  	      	'name' => $csv[$i-1][2],
			'desc' => $csv[$i-1][4],
			'haskiosk' => $csv[$i][1]  
		   );
		   
		   $dumbFormatting = false;
		   continue;
	}
	
	if(!isset($csv[$i][5])){
		$dumbFormatting = true;
		continue;
	}

    $sobiArray[] =
    array('long' => $csv[$i][9],
  	      'lat' => $csv[$i][10],
  	      'name' => $csv[$i][2],
		  'desc' => $csv[$i][4],
		  'haskiosk' => $csv[$i][5] 
  	     );
}

echo json_encode ($sobiArray);