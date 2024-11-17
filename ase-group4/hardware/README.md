# RaspberryPi

The password for the Raspberry Pi is raspberry.

The project is in /Desktop/ASE_Exercises/Project

The RaspberryPi uses the deployment address http://34.159.69.43.
For using localhost, add the argument localhost, for example use:

```console
foo@bar:~$ python main.py localhost=192.168.2.121
```


Get right localhost address on which the server is running:

When the server is running on Windows, type in cmd: 

    ipconfig /all
take: 

    IPv4-Adress : 192.168.2.110(Preferred)
Use this as an argument when running the program, for example:

    python main.py localhost=192.168.2.121


In one request of customer or deliverer, up to 5 deliveries are processed.


The box has an initial configuration with only the name and the raspberryId,
the remaining configurations are configurated by the dispatcher.


> **_NOTE:_**  
> The box is terminated properly when the box is deleted, for example through the GUI.
This is the only way to shut the box down properly.

