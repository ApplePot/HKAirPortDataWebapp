 <?php
  $course = array(
  "code" => "COMP3322",
  "title" => "Modern Tech on WWW",
  "sem" => 2,
  "class" => "B",
  "teacher" => array("last" => "Tam",
     "first" => "Anthony"));
  echo "output by 'var_dump'<br>";
  var_dump($course);
  echo "<br>output by 'print_r'<br>";
  print_r($course);
  echo "<br>output by 'var_export'<br>";
  var_export($course);
 ?>
<!DOCTYPE>
<html>
<body>
  <h1>Welcome to <?php echo $course['code']; ?></h1>
  <p>
    Current server time is <?php
      echo "<b>";
      echo date("H:i:s");
      echo "</b>";
    ?>
  </p>
</body>
</html>