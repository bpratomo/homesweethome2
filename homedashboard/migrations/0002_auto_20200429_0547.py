# Generated by Django 3.0.5 on 2020-04-29 05:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('homedashboard', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='home',
            old_name='including_utilies',
            new_name='including_utilities',
        ),
    ]
