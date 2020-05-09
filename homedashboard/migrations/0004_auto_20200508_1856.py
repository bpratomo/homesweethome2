# Generated by Django 3.0.6 on 2020-05-08 18:56

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('homedashboard', '0003_home_year_of_construction'),
    ]

    operations = [
        migrations.CreateModel(
            name='ScrapeId',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scrapedate', models.DateTimeField(auto_now_add=True)),
                ('scrapeId', models.UUIDField(default=uuid.uuid4)),
            ],
            options={
                'verbose_name': 'ScrapeId',
                'verbose_name_plural': 'ScrapeIds',
                'db_table': '',
                'managed': True,
            },
        ),
        migrations.AlterField(
            model_name='screenshot',
            name='home',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='screenshots', to='homedashboard.Home'),
        ),
    ]